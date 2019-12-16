from .qcircuit import QCircuit
from .qpreprocessor import QPreprocessor
from .qexporter import QExporter
from .constants import Classic, Qureg, Qubit


def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'qcircuit',
        'require': 'qcircuit/index'
    }]

