"""Versión piloto: no editar una versión aplicada; publicar una nueva versión."""
VERSION = 'pilot-2026-v1'
NOTICE_VERSION = 'pilot-notice-v1'
NOTICE = (
    'Participación voluntaria en un piloto del cuestionario, pendiente de revisión académica. '
    'Las respuestas quedan vinculadas a tu cuenta para controlar elegibilidad y duplicados; '
    'no son anónimas. No afectan notas ni asignación de prácticas. '
    'No incluyas datos de personas atendidas. Puedes salir antes de enviar. '
    'Estos registros no se presentarán como resultados definitivos de investigación.'
)
BLOCKS = {
    'priorities': {
        'title': 'Lo que importa al elegir',
        'instruction': 'Indica la importancia que tiene para ti cada aspecto al considerar un centro de prácticas.',
        'scale': ['Nada importante', 'Poco importante', 'Moderadamente importante', 'Importante', 'Muy importante'],
        'items': [
            {'id': 'proximity', 'text': 'Cercanía respecto del punto desde el cual te desplazas habitualmente.'},
            {'id': 'access', 'text': 'Facilidad para llegar al centro.'},
            {'id': 'supervision', 'text': 'Acompañamiento del supervisor o supervisora.'},
            {'id': 'learning', 'text': 'Oportunidades de aprendizaje relacionadas con Trabajo Social.'},
            {'id': 'resources', 'text': 'Disponibilidad de recursos para desarrollar las actividades asignadas.'},
        ],
    },
    'experience': {
        'title': 'Tu experiencia en una sede',
        'instruction': 'Pensando únicamente en la sede y el periodo indicados, señala tu grado de acuerdo.',
        'scale': ['Totalmente en desacuerdo', 'En desacuerdo', 'Ni de acuerdo ni en desacuerdo', 'De acuerdo', 'Totalmente de acuerdo'],
        'items': [
            {'id': 'guidance', 'text': 'Recibí orientación para desarrollar las actividades asignadas.'},
            {'id': 'feedback', 'text': 'Pude solicitar retroalimentación sobre mi desempeño.'},
            {'id': 'application', 'text': 'Las actividades permitieron aplicar conocimientos de Trabajo Social.'},
            {'id': 'learning', 'text': 'Tuve oportunidades de aprender procedimientos relacionados con mi formación.'},
            {'id': 'resources', 'text': 'Conté con los recursos necesarios para las actividades asignadas.'},
        ],
    },
}
