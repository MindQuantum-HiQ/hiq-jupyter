from .qcircuit import QCircuit
from .constants import Classic, Qureg, Qubit


def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'qcircuit',
        'require': 'qcircuit/index'
    }]
