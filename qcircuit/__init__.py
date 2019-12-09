from .qcircuit import QCircuit
from .constants import Classic, Qureg, Qubit


def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'qcircuit',
        'require': 'qcircuit/index'
    }]

import os
import os.path

from traitlets.config import Config
from nbconvert.exporters.python import PythonExporter

class QExporter(PythonExporter):
    """
    My custom exporter
    """

    # If this custom exporter should add an entry to the
    # "File -> Download as" menu in the notebook, give it a name here in the
    # `export_from_notebook` class member
    export_from_notebook = "HIQ QCircuit to the pure Python"

    def _file_extension_default(self):
        """
        The new file extension is `.test_ext`
        """
        return '.py'


