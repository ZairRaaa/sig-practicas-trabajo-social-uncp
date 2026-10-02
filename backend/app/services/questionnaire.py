"""Registro de instrumentos. Conservar las versiones aplicadas sin modificar sus textos."""
from copy import deepcopy
from app.services import pilot_2026_v1

VERSION = pilot_2026_v1.VERSION
_INSTRUMENTS = {
    pilot_2026_v1.VERSION: {
        'version': pilot_2026_v1.VERSION,
        'is_pilot': True,
        'notice_version': pilot_2026_v1.NOTICE_VERSION,
        'notice': pilot_2026_v1.NOTICE,
        'blocks': pilot_2026_v1.BLOCKS,
    },
}


def get_instrument(version: str) -> dict | None:
    instrument = _INSTRUMENTS.get(version)
    return deepcopy(instrument) if instrument is not None else None


def instrument_versions() -> list[str]:
    return [version for version, instrument in _INSTRUMENTS.items() if instrument['is_pilot']]


# Compatibilidad con la recepción actual; cambiar VERSION no elimina el registro histórico.
_current = _INSTRUMENTS[VERSION]
NOTICE_VERSION = _current['notice_version']
NOTICE = _current['notice']
BLOCKS = deepcopy(_current['blocks'])
