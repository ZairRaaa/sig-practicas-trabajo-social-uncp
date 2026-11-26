"""Lectura y revisión local del CSV basado en el Formato 01."""
import csv
import re
import unicodedata
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from uuid import NAMESPACE_URL, UUID, uuid5


REQUIRED = {
    'codigo_sede': None,
    'institucion': 200,
    'sede': 200,
    'categoria': 80,
    'departamento': None,
    'provincia': None,
    'distrito': 100,
    'direccion': 300,
    'descripcion': None,
    'fuente_institucional': None,
    'fecha_consulta': None,
}
HEADERS = (
    *REQUIRED, 'ubigeo', 'fuente_ubigeo', 'latitud', 'longitud', 'enlace_ubicacion',
    'fuente_ubicacion', 'ubicacion_confirmada', 'estado_revision', 'fecha_revision',
    'responsable_revision', 'mostrar_catalogo', 'sustento_publicacion',
    'referencia_publica', 'observaciones',
)
WORK_CODE = re.compile(r'[A-Za-z0-9_-]+')
DEMO_UBIGEOS = {'990001', '990002', '990003'}


def normalized(value: str) -> str:
    return ' '.join(unicodedata.normalize('NFC', value).casefold().split())


@dataclass
class SiteRow:
    line: int
    values: dict[str, str]
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    latitude: float | None = None
    longitude: float | None = None
    review_date: date | None = None
    already_loaded: bool = False

    @property
    def code(self) -> str:
        return self.values.get('codigo_sede', '')

    @property
    def site_id(self) -> UUID:
        return uuid5(NAMESPACE_URL, f'territorio-real/site/{normalized(self.code)}')

    @property
    def active(self) -> bool:
        return normalized(self.values['mostrar_catalogo']) in {'sí', 'si'}

    @property
    def verified(self) -> bool:
        return normalized(self.values['estado_revision']) == 'revisado con evidencia'


def create_template(path: Path) -> None:
    with path.open('x', encoding='utf-8-sig', newline='') as file:
        csv.writer(file, delimiter=';').writerow(HEADERS)


def read_rows(path: Path) -> list[SiteRow]:
    rows = []
    with path.open(encoding='utf-8-sig', newline='') as file:
        first_line = file.readline()
        file.seek(0)
        delimiter = ';' if first_line.count(';') > first_line.count(',') else ','
        reader = csv.reader(file, delimiter=delimiter, strict=True)
        header = [cell.strip() for cell in next(reader, [])]
        if set(header) != set(HEADERS) or len(header) != len(HEADERS):
            raise ValueError('El encabezado debe contener una vez cada columna de la plantilla.')

        line = reader.line_num + 1
        for cells in reader:
            if any(cell.strip() for cell in cells):
                if len(cells) == len(header):
                    values = {key: value.strip() for key, value in zip(header, cells)}
                    values = {key: '' if normalized(value) in {'pendiente', 'completar'} else value
                              for key, value in values.items()}
                    row = SiteRow(line, values)
                    validate_row(row)
                else:
                    row = SiteRow(line, {}, ['La cantidad de columnas difiere del encabezado.'])
                rows.append(row)
            line = reader.line_num + 1

    if not rows:
        raise ValueError('El CSV está vacío. Completa al menos una ficha de sede.')
    validate_batch(rows)
    return rows


def parse_coordinate(row: SiteRow, column: str, limit: int) -> float | None:
    value = row.values[column]
    if not value:
        message = 'falta resolver la coordenada WGS84.'
        if row.values['enlace_ubicacion']:
            message = 'obtén y revisa la coordenada WGS84 a partir del enlace.'
        row.errors.append(f'{column}: {message}')
        return None
    if re.fullmatch(r'[+-]?[0-9]+(?:\.[0-9]+)?', value):
        number = float(value)
        if -limit <= number <= limit:
            return number
    row.errors.append(f'{column}: usa un número entre {-limit} y {limit} con punto decimal.')
    return None


def parse_date(row: SiteRow, column: str) -> date | None:
    value = row.values[column]
    if value:
        try:
            parsed = date.fromisoformat(value)
            if value == parsed.isoformat():
                return parsed
        except ValueError:
            pass
        row.errors.append(f'{column}: indica una fecha válida con formato AAAA-MM-DD.')
    return None


def validate_row(row: SiteRow) -> None:
    values = row.values
    for column, limit in REQUIRED.items():
        if not values[column]:
            row.errors.append(f'{column}: dato obligatorio.')
        elif limit and len(values[column]) > limit:
            row.errors.append(f'{column}: máximo {limit} caracteres.')
    for column, value in values.items():
        if '\x00' in value:
            row.errors.append(f'{column}: contiene un carácter nulo.')
    if row.code and not WORK_CODE.fullmatch(row.code):
        row.errors.append('codigo_sede: usa letras A–Z, números, guiones o guiones bajos.')
    if len(values['referencia_publica']) > 1000:
        row.errors.append('referencia_publica: máximo 1000 caracteres.')

    ubigeo = values['ubigeo']
    if not ubigeo:
        row.warnings.append('Sin UBIGEO: el distrito quedará pendiente en el catálogo.')
    elif not re.fullmatch(r'[0-9]{6}', ubigeo) or ubigeo in DEMO_UBIGEOS:
        row.errors.append('ubigeo: usa el código oficial de seis dígitos del distrito.')
    elif not values['fuente_ubigeo']:
        row.errors.append('fuente_ubigeo: indica de dónde obtuviste el código consignado.')

    row.latitude = parse_coordinate(row, 'latitud', 90)
    row.longitude = parse_coordinate(row, 'longitud', 180)
    if not (values['fuente_ubicacion'] or values['enlace_ubicacion']):
        row.errors.append('Indica la fuente de la ubicación o el enlace al local.')

    parse_date(row, 'fecha_consulta')
    row.review_date = parse_date(row, 'fecha_revision')
    location_status = normalized(values['ubicacion_confirmada'])
    if location_status not in {'', 'confirmado'}:
        row.errors.append('ubicacion_confirmada: usa «Confirmado» o «Pendiente».')
    if normalized(values['estado_revision']) not in {'', 'revisado con evidencia'}:
        row.errors.append('estado_revision: usa «Revisado con evidencia» o «Pendiente».')
    if row.verified:
        if location_status != 'confirmado':
            row.errors.append('Para marcar la sede como revisada, confirma que el punto corresponde al local.')
        if not values['fecha_revision'] or not values['responsable_revision']:
            row.errors.append('Para marcar la sede como revisada, indica fecha y rol o código responsable.')

    if normalized(values['mostrar_catalogo']) not in {'sí', 'si', 'no'}:
        row.errors.append('mostrar_catalogo: registra una decisión explícita, «Sí» o «No».')
    if row.active and not (row.verified and values['sustento_publicacion']):
        row.errors.append('Para mostrar la sede, completa la revisión con evidencia y el sustento de publicación.')


def validate_batch(rows: list[SiteRow]) -> None:
    by_code = defaultdict(list)
    by_site = defaultdict(list)
    by_institution = defaultdict(list)
    by_ubigeo = defaultdict(list)
    by_district = defaultdict(list)

    for row in rows:
        if not row.values:
            continue
        values = row.values
        institution = normalized(values['institucion'])
        site = normalized(values['sede'])
        district = tuple(normalized(values[key]) for key in ('departamento', 'provincia', 'distrito'))
        if row.code:
            by_code[normalized(row.code)].append(row)
        if institution:
            by_institution[institution].append(row)
        if institution and site:
            by_site[institution, site].append(row)
        if values['ubigeo'] and all(district):
            by_ubigeo[values['ubigeo']].append((row, district))
            by_district[district].append(row)

    for group in by_code.values():
        if len(group) > 1:
            for row in group:
                row.errors.append('codigo_sede: código repetido en el CSV.')
    for group in by_site.values():
        if len(group) > 1:
            for row in group:
                row.errors.append('La institución y el nombre de sede se repiten en el CSV.')
    for group in by_institution.values():
        if len({(row.values['institucion'], row.values['categoria']) for row in group}) > 1:
            for row in group:
                row.errors.append('Usa el mismo nombre oficial y categoría en las fichas de esta institución.')
    for group in by_ubigeo.values():
        if len({district for _, district in group}) > 1:
            for row, _ in group:
                row.errors.append('ubigeo: el código se asignó a distritos diferentes en el CSV.')
    for group in by_district.values():
        if len({row.values['ubigeo'] for row in group}) > 1:
            for row in group:
                row.errors.append('ubigeo: hay códigos distintos para el mismo distrito en el CSV.')
