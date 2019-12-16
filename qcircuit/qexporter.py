from nbconvert.exporters.python import PythonExporter
from .qpreprocessor import QPreprocessor

class QExporter(PythonExporter):

    def __init__(self, config=None, **kw):
        super().__init__(config, **kw)

        self.register_preprocessor(QPreprocessor(), enabled=True)

    # If this custom exporter should add an entry to the
    # "File -> Download as" menu in the notebook, give it a name here in the
    # `export_from_notebook` class member
    export_from_notebook = "HIQ QCircuit to the pure Python"

    def _file_extension_default(self):
        """
        The new file extension is `.test_ext`
        """
        return '.py'