from nbconvert.preprocessors import Preprocessor
import re
from .constants import Classic, Qureg, Qubit
from .qcircuit import QCircuit

class QPreprocessor(Preprocessor):

    def delete_self_imports(self, cell):
        source = cell["source"]
        source = re.sub(r'^.*from qcircuit.*$', '', source, flags=re.MULTILINE)
        cell["source"] = source

    def generate_function(self, qregs, qschema, circuit_name):
        arg_names = [r["name"] for r in qregs]
        res = "def %s(eng, %s):\n" % (circuit_name, ', '.join(arg_names))

        short_qregs = {}
        for reg in qregs:
            print(reg)
            if reg["type"] == "CLASSIC":
                short_qregs[reg["name"]] = Classic
            elif reg["type"] == "QUANTUM":
                short_qregs[reg["name"]] = Qubit
            else:
                short_qregs[reg["name"]] = (Qureg, reg["size"])


        circuit = QCircuit(**short_qregs)
        circuit.current_schema = qschema
        circuit.use_text_out_on_run = True
        res += circuit.run(None, *arg_names)

        return res

    def replace_circuit(self, cell):
        md = cell["metadata"]
        source = cell["source"]
        if md is None or "_hiq_info" not in md: return

        qregs = md["_hiq_info"]["qregs"]
        qschema = md["_hiq_info"]["qschema"]

        rx = r'^([^\s]+)\s*=\s*QCircuit.create.*$'
        search = re.search(rx, source, flags=re.MULTILINE)
        if search:
            circuit_name = search.group(1)
            replacement = self.generate_function(qregs, qschema, circuit_name)

            cell["source"] = re.sub(rx, replacement, source, flags=re.MULTILINE)



    def preprocess(self, nb, resources):
        for idx, cell in enumerate(nb.cells):
            if cell["cell_type"] == "code":
                self.delete_self_imports(cell)
                self.replace_circuit(cell)

        return nb, resources