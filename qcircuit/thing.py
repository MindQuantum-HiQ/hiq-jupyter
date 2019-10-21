from __future__ import print_function
from jupyter_react import Component
from projectq.ops import X, H, Measure

class Thing(Component):
    module = 'Thing'

    def __init__(self, **kwargs):
        print('inited')
        super(Thing, self).__init__(target_name='react.thing', **kwargs)
        self.on_msg(self._handle_msg)
		
    def set(self, row, col, gateEncoded):
        self.send({"action": "set_gate", "row": row, "col": col, "gateEncoded": gateEncoded});
		
    def setCircuit(self, circuit):
        self.send({"action": "set_circuit", "circuit": circuit});
        self.t = 't1'
		
    def _handle_msg(self, msg):
        self._last_msg = msg
        self.current_schema = msg['content']['data']['qschema']

    def run(self, eng, q0):
        for gate in self.current_schema[1]:
            if gate == 'X': X | q0
            if gate == 'H': H | q0

