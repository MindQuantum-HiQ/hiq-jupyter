from __future__ import print_function
from jupyter_react import Component
from projectq.ops import X, Y, Z, S, Rx, Ry, Rz, H, Measure, Swap, SqrtSwap
from projectq.meta import Control
from .constants import Classic, Qureg, Qubit
from IPython.display import display

class QCircuit(Component):
    module = 'QCircuit'

    def __init__(self, **kwargs):
        #data = [[""], ["X"], ["","","","X","","M"],["","","","","H"],["","Y"]]
        #super(QCircuit, self).__init__(target_name='qcircuit', **kwargs)

        self.qregs = self._generate_qregs(**kwargs)
        self.use_text_out_on_run = False

        super(QCircuit, self).__init__(target_name='qcircuit', props={
            "circuit": [[""]],
            "qregs": self.qregs,
        })
        self.on_msg(self._handle_msg)
        self.current_schema = [None] * len(self._expanded_qregs)

    @staticmethod
    def create(**kwargs):
        o = QCircuit(**kwargs)
        o.display()
        return o

    @staticmethod
    def alloc():
        return 'ALLOC_STUB'

    def _generate_qregs(self, **kwargs):
        qregs = []
        self._expanded_qregs = []

        for name, value in kwargs.items():
            if value == Classic:
                data = {
                    "name": name,
                    "type": "CLASSIC",
                }
                qregs.append(data)
                self._expanded_qregs.append(data)
            elif value == Qubit:
                data = {
                    "name": name,
                    "type": "QUANTUM",
                }
                qregs.append(data)
                self._expanded_qregs.append(data)
            else:
                assert isinstance(value, tuple), "Qureg declaration expected as tuple"
                assert len(value) in range(1, 3), "Tuple size error"

                if len(value) == 2:
                    _, size = value
                else:
                    size, = value

                qregs.append({
                    "name": name,
                    "type": "QUREG",
                    "size": size,
                })
                for i in range(size):
                    self._expanded_qregs.append({
                        "name": name,
                        "type": "QUREG",
                        "index": i,
                    })

        return qregs

    def __call__(self, eng, *args, **kwargs):
        self.run(eng, *args, **kwargs)

    def set(self, row, col, gateEncoded):
        self.send({"action": "set_gate", "row": row, "col": col, "gateEncoded": gateEncoded})
		
    def setCircuit(self, circuit):
        self.send({"action": "set_circuit", "circuit": circuit, "qregs": self.qregs})
		
    def _handle_msg(self, msg):
        self._last_msg = msg
        if msg['content']['data']['action'] == 'redisplay':
            self.setCircuit(self.current_schema)

        elif msg['content']['data']['action'] == 'save_schema':
            self.current_schema = msg['content']['data']['qschema']

    def run(self, eng, *args, **kwargs):
        gates = {
            "X": X,
            "Y": Y,
            "Z": Z,
            "Rx": Rx,
            "Ry": Ry,
            "Rz": Rz,
            "H": H,
            "M": Measure,
            "Swap": Swap,
            "SqrtSwap": SqrtSwap,
        }

        name2obj = dict(kwargs)
        for i, obj in enumerate(args):
            name2obj[self.qregs[i]["name"]] = obj
#            print(self.qregs[i]["name"])

#        print(len(args))

        ret = ""

        schema_len = 0
        for line in self.current_schema:
            schema_len = max(schema_len, len(line))

        print(schema_len)
        for x in range(schema_len):
            for y, exp_qreg in enumerate(self._expanded_qregs):
                if len(self.current_schema[y]) <= x or self.current_schema[y][x] == "": continue

                encodedGate = self.current_schema[y][x]
                encodedGateT = encodedGate.split('-')
                gate = encodedGateT[0]
                ctrls = encodedGateT[1].split(',') if len(encodedGateT) > 1 else []

                gate_op = gates[gate]

                if exp_qreg['type'] == 'QUREG':
                    if not self.use_text_out_on_run:
                        op_subject = name2obj[exp_qreg['name']][int(exp_qreg['index'])]
                    text_subject = "%s[%s]" % (exp_qreg['name'], exp_qreg['index'])
                else:
                    op_subject = name2obj[exp_qreg['name']]
                    text_subject = exp_qreg['name']

                if not ctrls:
                    if self.use_text_out_on_run:
                        ret += "\t%s | %s\n" % (gate, text_subject)
                    else:
                        gate_op | op_subject
#                    print("Debug: ", gate, " | ", exp_qreg['name'])
                else:
                    resolved_ctrls = []
                    text_resolved_ctrls = []
                    for c_index in ctrls:
                        exp_qreg = self._expanded_qregs[int(c_index)]
                        if exp_qreg['type'] == 'QUREG':
                            if not self.use_text_out_on_run:
                                ctrl_obj = name2obj[exp_qreg['name']][exp_qreg['index']]
                            text_ctrl_obj = "%s[%s]" % (exp_qreg['name'], exp_qreg['index'])
                        else:
                            ctrl_obj = name2obj[exp_qreg['name']][0]
                            text_ctrl_obj = "%s[0]" % (exp_qreg['name'])

                        if not self.use_text_out_on_run:
                            resolved_ctrls.append(ctrl_obj)
                        text_resolved_ctrls.append(text_ctrl_obj)

                    if self.use_text_out_on_run:
                        ret += "\twith Control(eng, [%s]):\n" % (', '.join(text_resolved_ctrls))
                        ret += "\t\t%s | %s\n" % (gate, text_subject)
                    else:
#                        print(name2obj, exp_qreg['name'], ctrl_obj)
#                        print("Debug: ", gate, " with Control([", ctrls, "])", ctrl_obj)
                        with Control(eng, resolved_ctrls):
                            gate_op | op_subject
        return ret

    def display(self):
        self.send({"action": "pre_display"});
        display(self)