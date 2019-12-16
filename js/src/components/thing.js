import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Icon from '@material-ui/core/Icon';
import Paper from '@material-ui/core/Paper';
import { green, lime, teal, cyan, grey } from '@material-ui/core/colors/';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classNames from 'classnames';
import interact from 'interactjs';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
//import Block from './Block';
//import debounce  from 'debounce';
import _ from 'lodash';
import TextField from '@material-ui/core/TextField';
import ReactDOM from 'react-dom';

//import {  setQuantumCircuit, } from '../App/actions';
//import { setPythonCode, setCircuitCode } from '../App/actions'; // temp
import { blocksJSX, blocksConfig, palette } from './quantumBlocks';


var debounce = (fn, wait) => {
  let timeout1;

  return () => {
    if (timeout1) return

    timeout1 = setTimeout(() => { fn(); timeout1 = null; }, wait)
  }
};


const styles = theme => ({
  draggable: {
    position: 'absolute',
  },
  container: {
    position: 'relative',
  },
  block_selected: {
    outline: '4px solid #BBB',
  },
  newBlocks: {
    width: 670,
    height: 120 - 40,
    left: 170,
    position: 'relative',
    overflow: 'visible',
  },
  button: {
    margin: theme.spacing.unit,
  },
  area: {
    width: '100%',
    height: '100%',
  },
  svg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  circuit_label: {
    position: 'absolute',
  }

});

const doubleClickTimeWindowMs = 500;


class QuantumCircuit extends React.PureComponent {

  state = {
    selectedBlock: null,
    lastClickTime: null,
    blockEditCtrls: null,

    isShowEditMode: false,
    randomSeed: Math.random(),
	mainContainerId: "main" + Math.floor(100000000 / Math.random()),

    qregs: [
//      {name: 'q[0]', /*type: 'CLASSIC'*/},
//      {name: 'q[1]'},
//      {name: 'q[2]'},
    ],

    blocks: [
/*      {type: 'X', id: 1, pos: [3, 2], ctrls: [0, 3]},
      {type: 'Y', id: 2, pos: [0, 4], ctrls: []},
      {type: 'T', id: 3, pos: [7, 2], ctrls: []},
*/    ]
  };

  SVGratio = 1

  constructor() {
  console.error('CONSTRUCTOR')
    super()

    this.canvas = document.createElement("canvas")
    this.canvasContext = this.canvas.getContext("2d")
    this.canvasContext.font = "16px Times New Roman";
  }

  componentDidMount() {
    let blockName = '';

    this.initQreg()
    this.initInteractForNewBlocks()
    this.initInteractForExistingBlocks()

    this.initStateFromBlockData()

    this.props.comm.on_msg(this.commMessagesHandler)

    if (this.props.cell && this.props.cell._metadata._hiq_info.qregs) {
        this.forceUpdate(() => {
            this.makeCircuitTransitionOnQregsChanged(this._inited_from_qreg_data, this.props.cell._metadata._hiq_info.qregs)
        })
    }

    this.demandSaveChanges()
  }

  commMessagesHandler = (msg) => {
	if (msg.content && msg.content.data) {
	  const data = msg.content.data
	  console.log(data)

	  switch (data.action) {
	    case 'pre_display':
		  ReactDOM.unmountComponentAtNode()
	  }
	}
  }

  initQreg = (qregsData) => {
    if (!qregsData) qregsData = this.props.qregs

    this._inited_from_qreg_data = qregsData

    if (qregsData) {
        var qregs = []

        qregsData.forEach((reg, j) => {
            if (reg.type == 'QUREG') {
                for (let i = 0; i < reg.size; i++) {
                    qregs.push({ name: `${reg.name}[${i}]`, type: 'QUANTUM' })
                }
            } else {
                qregs.push(reg)
            }
        })

      this.setState({ qregs })
    }
  }

  makeCircuitTransitionOnQregsChanged = (newQregsData, oldQregsData) => {
    let line2line = {}
    let curOldLine = 0

    console.log('old=', oldQregsData, ' new=', newQregsData)

    oldQregsData.forEach((oldReg, ind) => {
        let matchedRegInd = -1
        newQregsData.forEach((newReg, newInd) => {
            if (oldReg.name == newReg.name && oldReg.type == newReg.type) {
                matchedRegInd = newInd
            }
        })

        console.log('matchedRegInd=',matchedRegInd)
        if (matchedRegInd == -1) {
            if (oldReg.type == 'QUREG') {
                for (let i = 0; i < oldReg.size; i++) {
                    line2line[curOldLine] = -1
                    curOldLine++;
                }
            } else {
                line2line[curOldLine] = -1
                curOldLine++;
            }
        } else {
            const newReg = newQregsData[matchedRegInd]

            if (oldReg.type == 'QUREG') {
                let n = Math.min(oldReg.size, newReg.size)
                let startNewInd = -1

                this.state.qregs.forEach((q, ind) => {
                    if (startNewInd == -1 && q.name == oldReg.name + "[0]") {
                        startNewInd = ind
                    }
                })

                if (startNewInd != -1) {
                    for (let i = 0; i < n; i++) {
                        line2line[curOldLine] = startNewInd + i
                        curOldLine++;
                    }
                } else {
                    n = 0
                }

                for (let i = n; i < oldReg.size; i++) {
                    line2line[i] = -1
                    curOldLine++;
                }
            } else {
                let startNewInd = -1
                this.state.qregs.forEach((q, ind) => {
                    if (startNewInd == -1 && q.name == oldReg.name) {
                        startNewInd = ind
                    }
                })

                line2line[curOldLine] = startNewInd
                curOldLine++
            }
        }
    })

    let newBlocks = []
    this.state.blocks.forEach(block => {
        let newBlock = {...block}
        if (line2line[newBlock.pos[1] /* y */] == -1) return

        newBlock.pos[1] = line2line[newBlock.pos[1] /* y */]

        newBlock.ctrls = []
        block.ctrls.forEach(ctrl => {
            if (line2line[ctrl] != -1) {
                newBlock.ctrls.push(line2line[ctrl])
            }
        })

        newBlocks.push(newBlock)
    })

    console.log('newBlocks=', newBlocks)

    this.setState({ blocks: newBlocks })
  }

  updateBlocksByTransitionMap = (regTransition) => {
    let newBlocksState = this.state.blocks.map(block => {
      const transY = regTransition[block.pos[1]]
      if (transY !== undefined) {
        block.pos[1] = transY
      }
      block.ctrls = block.ctrls.map(y => {
        const newY = regTransition[y]
        if (newY !== undefined) {
          y = newY
        }
        return y
      })

      return block
    })

    this.setState({ blocks: newBlocksState })
  }

  updateRegs = () => {
    var regTransition = {}
    const newRegs = this.initQreg()

    this.state.qregs.forEach((reg, index) => {
      let tInd = null;

      newRegs.forEach((el, i) => {
        if (el.name == reg.name && el.type == reg.type) tInd = i;
      })

      if (tInd !== null) {
        regTransition[index] = tInd
      }
    })

    this.updateBlocksByTransitionMap(regTransition)
  }

  componentDidUpdate = (prevProps) => {
    return

    let prevNames = this.props.block.get('inputParams').reduce((acc, param) => acc + '|' + param.get('paramName')  + param.get('paramType'), "" ) +
                    this.props.block.get('outputParams').reduce((acc, param) => acc + '|' + param.get('paramName')  + param.get('paramType'), "" )
    let newNames = prevProps.block.get('inputParams').reduce((acc, param) => acc + '|' + param.get('paramName')  + param.get('paramType'), "" ) +
                   prevProps.block.get('outputParams').reduce((acc, param) => acc + '|' + param.get('paramName')  + param.get('paramType'), "" )

    if (prevNames != newNames) {
      this.updateRegs()
    }

    if (this.props.loadKey != prevProps.loadKey) {
      this.initStateFromBlockData()
    }
  }

  initStateFromBlockData = (circuitData) => {
  	var blocks = []

  	console.log('metadata:', this.props.cell._metadata._hiq_info)
  	if (this.props.cell._metadata._hiq_info.qschema) circuitData = this.props.cell._metadata._hiq_info.qschema

  	if (!circuitData) circuitData = this.props.circuit;
//    console.log(this.props.block.toJSON())

  	if (circuitData && Array.isArray(circuitData) && circuitData.length > 0) {
  	  circuitData.forEach((line, row) => {
  		line.forEach((blockEncoded, col) => {
  		  if (blockEncoded) {
          // Swap:3-1,2
          // Rx(1.2)-3,4
          // GATE_NAME:PAIRED_WITH(ARGUMENT)-CONTROL1,CONTROL2,...
          const [gateNameAndParams, ctrlsEncoded] = blockEncoded.split('-')
          const ctrls = ctrlsEncoded ? ctrlsEncoded.split(',') : []
          const [gateWithPair, argument] = gateNameAndParams.split('(')
          const [angle] = argument ? argument.split(')') : []
          const [gateType, pairedY] = gateWithPair.split(':')


            blocks.push({
              type: gateType,
              id: blocks.length + 1,
              pos: [col, row],
              ctrls: ctrls,
                angle: angle,
                pairedY: pairedY,
    		})
    		}
  		})
  	  })
  	}

  	this.setState({
      blocks,
      selectedBlock: null,
    })
  }

  initInteractForNewBlocks = () => {
    interact('#' + this.state.mainContainerId + ' .draggable')
      .draggable({
        // enable inertial throwing
        inertia: false,
        // keep the element within the area of it's parent
        ignoreFrom: '[data-non-draggable]',
        // enable autoScroll
        autoScroll: true,

        // call this function on every dragmove event
        onmove: (event) => {
          const target = event.target,
              x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
              blockType = (target.getAttribute('data-block-type'));


          event.target.style.webkitTransform =
          event.target.style.transform =
              'translate(' + x + 'px, ' + y + 'px)';

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          this.lastDelta = [event.dx, event.dy]

          const originalX = parseInt(target.style.left), originalY = parseInt(target.style.top)
          this.onBlockMove( x + originalX, y + originalY, null, blockType )
//          console.log((target.getAttribute('data-x')))

          if (!this.state.isShowEditMode) {
            this.onStartDrag()
          }
        },
        onend: (event) => {

          let target = event.target,
              x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
              blockType = (target.getAttribute('data-block-type'));

          if (this.lastDelta) {
            x -= this.lastDelta[0]
            y -= this.lastDelta[1]
          }

          const originalX = parseInt(target.style.left), originalY = parseInt(target.style.top)

          this.onBlockMove( x + originalX, y + originalY, null, blockType )
          this.onCreateNewBlock(blockType, x + originalX, y + originalY)
        }
      });
  }

  onBlockMove = (x, y, blockId, blockType, isPairedByY) => {
    const calcFunction = blockId != null
      ? this.calcGridCoordsByInnerCoords
      : this.calcGridCoordsByOuterCoords
    const gridCoords = calcFunction(x, y)

    this.highlightRegOnDragging(gridCoords)
    if (!blockType) {
      blockType = this.getBlockById(blockId).type
    }

    if (this.isPairedBlockType(blockType)) {
      this.processPairedMovement(gridCoords, blockType, blockId, isPairedByY)
    }
  }

  processPairedMovement = (gridCoords, blockType, blockId, isPairedByY) => {
    let ghostCoords = null
    if (this.state.movementIsPairedByY != isPairedByY) {
      this.setState({ movementIsPairedByY : isPairedByY })
    }

    const isPositionNotOccupied = (pos) => {
      let ok = true
      this.state.blocks.forEach(block => {
        if (block.id != blockId && _.isEqual(block.pos, pos) ) ok = false
      })

      return ok
    }
    if (gridCoords && gridCoords.length) {
      if (blockId != null) {
        const block = this.getBlockById(blockId)
        let variantPos = [gridCoords[0], isPairedByY ? block.pos[1] : block.pairedY]
        if (isPositionNotOccupied(variantPos) ) {
          if (!isPairedByY && block.pairedY != gridCoords[1] || isPairedByY && block.pos[1] != gridCoords[1]) {
            ghostCoords = variantPos
          }
        }
      } else {
        this.state.qregs.forEach((reg, y) => {
          if (ghostCoords || y == gridCoords[1]) return

          let variantPos = [gridCoords[0], y]
  //        console.log(variantPos)

          if (reg.type == 'QUANTUM') {
            if (isPositionNotOccupied(variantPos)) {
              ghostCoords = variantPos
            }
          }
        })
      }
    }

    if (gridCoords[2] && ghostCoords) ghostCoords.push(gridCoords[2])

    this.setState({
      ghostPairedCoords: ghostCoords,
      ghostPairedBlockType: blockType,
      ghostPairedBlockId: ghostCoords && blockId,
    })
  }

  isPairedBlockType = (blockType) => {
    return ['Sw', 'SqRSw'].indexOf(blockType) != -1
  }

  getBlockById = (blockId) => {
    return this.state.blocks.reduce((acc, block) => block.id == blockId ? block : acc, null);
  }

  highlightRegOnDragging = (gridCoords) => {

    if (gridCoords.length) {
      this.setState({ highlightRegPos: gridCoords })
    } else {
      this.setState({ highlightRegPos: null })
    }
  }

  initInteractForExistingBlocks = () => {
    interact('#' + this.state.mainContainerId + ' .svg_draggable')
      .draggable({
        // enable inertial throwing
        inertia: false,
        // keep the element within the area of it's parent
        ignoreFrom: '[data-non-draggable]',
        // enable autoScroll
        autoScroll: true,

        // call this function on every dragmove event
        onmove: (event) => {
          const target = event.target,
              x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx * this.SVGratio,
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy * this.SVGratio,
              blockId = target.getAttribute('data-block-id'),
              pairedByY = target.getAttribute('data-paired-by-y')

          event.target.style.webkitTransform =
          event.target.style.transform =
              "matrix(1,0,0,1,"+x+","+y+")";

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);

//          console.log(this.state.blocks)
          this.onBlockMove( x, y, blockId, null, pairedByY)

          if (!this.state.isShowEditMode) {
            this.onStartDrag()
          }
        },
        onend: (event) => {
          const target = event.target,
              x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
              id = target.getAttribute('data-block-id')


          const originalX = parseInt(target.style.left), originalY = parseInt(target.style.top)

          this.onEndDragForExisting(id, x, y)
        }
      });
  }

  componentWillUnmount(prevProps) {
    interact('.draggable').unset()
    interact('.svg_draggable').unset()
  }

  onBlockRef = (index, blockSchemaInfo) => node => {
    if (!node) return;

    const schemaPos = blockSchemaInfo.pos;

    const [ newX, newY ] = schemaPos;

    node.style.webkitTransform =
    node.style.transform =
        'translate(' + newX + 'px, ' + newY + 'px)';

    node.setAttribute('data-x', newX);
    node.setAttribute('data-y', newY);
  }

  onStartDrag = () => {
    this.setState({
      isShowEditMode: true
    })
  }

  demandSaveChanges = () => {
    setTimeout(() => {
      const circuit = this.compileQSchemaFromState();
//      console.debug(circuit)
    }, 100)
  }

  onCreateNewBlock = (blockType, x, y, ctrlsEncoded) => {
    console.log(x, y)

    const gridCoords = this.calcGridCoordsByOuterCoords(x, y)
    if (gridCoords.length) {
      this.processCreationOfNewBlock(blockType, gridCoords, ctrlsEncoded)
      this.demandSaveChanges()
    }

    this.setState({
      isShowEditMode: false,
      randomSeed: Math.random(),
	    qseed: Math.random()
    })
  }

  processCreationOfNewBlock = (blockType, gridCoords, ctrlsEncoded) => {
    const { ghostPairedCoords } = this.state;
    this.setState({
      ghostPairedCoords: null,
      ghostPairedBlockType: null,
      ghostPairedBlockId: null,
    })
    console.log(ghostPairedCoords, gridCoords)

	  const ctrls = ctrlsEncoded ? ctrlsEncoded.split(',') : []

    let { blocks } = this.state;
    if (gridCoords[2] == 'middle') {
      blocks = blocks.map((block) => {
        if (block.pos[0] >= gridCoords[0]) block.pos[0]++;
        return block
      })
      gridCoords.pop()
    }

	  const err = this.validateBlockMovement(blocks, gridCoords, ctrls)

	  if (!err) {

		  const newId = blocks.reduce((acc, block) => Math.max(acc, block.id), 0) + 1

      let newBlock = {
			  type: blockType,
			  id: newId,
			  pos: gridCoords,
			  ctrls: ctrls,
			}
      if (this.isPairedBlockType(blockType)) {
        if (!ghostPairedCoords) return;

        newBlock.pairedY = ghostPairedCoords[1]
      }

		  this.setState({
			blocks: [...blocks, newBlock]
		  })
	  } else {
		  console.log(err)
	  }
  }

  validateBlockMovement = (blocks, newPos, newCtrls, id) => {
  	var err = null;

  	const validatePos = (block) => {
  		if (this.state.qregs[newPos[1]].type == 'CLASSIC') return ["input_is_classic", newPos[1]]

  		if (block.pos[0] == newPos[0] && block.pos[1] == newPos[1]) return ["position_is_occupied", newPos]

  		if (block.pos[0] == newPos[0]) {
  			var conflict = false, conflictY;
  			block.ctrls.forEach(y => {
  				if (y == newPos[1]) conflict = true, conflictY = y;
  			})
  			newCtrls.forEach(y => {
  				if (y == block.pos[1]) conflict = true, conflictY = y;
  			})


  			return conflict ? ["control_conflict", conflictY] : null;
  		}
  	}

  	const validateSelfControls = (block) => {
  		var conflict = false, conflictY;
  		block.ctrls.forEach(y => {
  			if (y == newPos[1]) conflict = true, conflictY = y;
  		})

  		return conflict ? ["control_self_conflict", conflictY] : null;
  	}

  	blocks.forEach((block) => {
  		if (err) return;

  		if (block.id == id) {
  			err = validateSelfControls(block)
  		} else {
  			err = validatePos(block)
  		}
  	});

  	return err;
  }

  findBlockByPos = (innerX, innerY) => {
    return this.state.blocks.reduce((acc, block) => block.pos[0] == innerX && block.pos[1] == innerY && block.id || acc);
  }

  onEndDragForExisting = (blockId, innerX, innerY) => {
    const gridCoords = this.calcGridCoordsByInnerCoords(innerX, innerY)
    const { ghostPairedCoords } = this.state;

    this.setState({
      ghostPairedCoords: null,
      ghostPairedBlockType: null,
      ghostPairedBlockId: null,
    })

    if (gridCoords.length == 0) {
      this.setState({
        blocks: this.state.blocks.filter(block => block.id != blockId),
        selectedBlock: null,
      })
    } else {
      let { blocks } = this.state;
      if (gridCoords[2] == 'middle') {
        blocks = blocks.map((block) => {
          if (block.pos[0] >= gridCoords[0]) block.pos[0]++;
          return block
        })
        gridCoords.pop()
      }
  	  const err = this.validateBlockMovement(blocks, gridCoords, [], blockId)

  	  if (!err) {

  		  this.setState({
  			blocks: blocks.map(block => {
  			  if (block.id != blockId) return block

          let updatedBlock = {...block, pos: gridCoords}
          if (this.isPairedBlockType(block.type)) {
            if (!ghostPairedCoords) return block

            updatedBlock.pairedY = ghostPairedCoords[1]
          }

  			  return updatedBlock
  			})
  		  })
  	  } else {
  		console.log(err)
  	  }
    }

    this.demandSaveChanges()

    this.setState({
      isShowEditMode: false,
      randomSeed: Math.random(),
    })
  }

  renderTempCodeEditor = () => {
    const pythonCode = this.props.allBlocks.getIn([this.props.currentBlockName, 'pythonCode'])
    const circuitCode = this.props.allBlocks.getIn([this.props.currentBlockName, 'circuitCode'])
    const blockType = this.props.allBlocks.getIn([this.props.currentBlockName, 'blockType'])

    let code = blockType == 'quantum' ? circuitCode : pythonCode

    const changed = (event) => {
      if (blockType == 'quantum') {
        this.props.onSetCircuitCode(this.props.currentBlockName, event.target.value)
      } else {
        this.props.onSetPythonCode(this.props.currentBlockName, event.target.value)
      }
    };

    return (
      <div style={{position: 'fixed', bottom: 10, width: '90%', left: 50}}>
        <TextField style={{width: '100%'}}
         id="outlined-multiline-flexible"
         label={"Quantum code"}
         multiline
         rowsMax="5"
         defaultValue={code}
         onChange={changed}
         className={this.props.classes.textField}
         margin="normal"
         helperText="hello"
         variant="outlined"
        />
      </div>
    )
  }

  renderLabels = () => {
    const { qregs } = this.state;

    return (

      <g transform="matrix(1.7,0,0,1.7,44.9724,57.1587)">
        {qregs.map((reg, ind) => {
          const name = reg.name
          return (
          <g key={ind+reg.name}>
            {/*<g id="gSjpf81cb2kt" transform="matrix(1,0,0,1,21.672,0)">
              <path d="M0.391,0.359c0-0.173,0-0.359-0.188-0.359C0,0,0,0.189,0,0.359v9.266c0,0.174,0,0.358,0.203,0.358
        c0.188,0,0.188-0.188,0.188-0.358V0.359z M7.707,5.156c0.049-0.109,0.049-0.143,0.049-0.172c0-0.018,0-0.049-0.047-0.156
        L5.976,0.234C5.914,0.062,5.851,0.001,5.742,0.001c-0.106,0-0.201,0.095-0.201,0.202c0,0.031,0,0.048,0.048,0.156l1.767,4.625
        L5.589,9.593C5.541,9.7,5.541,9.735,5.541,9.78c0,0.107,0.095,0.203,0.199,0.203c0.127,0,0.176-0.109,0.205-0.203L7.707,5.156z" />
              <path d="M5.537,5.014c0-0.797-0.047-1.594-0.393-2.328C4.693,1.718,3.865,1.56,3.457,1.56c-0.609,0-1.327,0.267-1.75,1.188
        c-0.312,0.688-0.359,1.47-0.359,2.267c0,0.75,0.032,1.641,0.454,2.405c0.422,0.797,1.155,1,1.644,1
        c0.529,0,1.297-0.203,1.731-1.156c0.312-0.692,0.36-1.47,0.36-2.253V5.014z M3.445,8.2c-0.393,0-0.981-0.25-1.156-1.203
        C2.183,6.403,2.183,5.482,2.183,4.891c0-0.642,0-1.297,0.078-1.828c0.188-1.188,0.938-1.279,1.188-1.279
        c0.33,0,0.982,0.187,1.172,1.17c0.107,0.562,0.107,1.312,0.107,1.939c0,0.75,0,1.42-0.107,2.06C4.462,7.905,3.9,8.2,3.447,8.2
        H3.445z" />
            </g>
            */}
            <text x={-10} y={5 + ind * 28} fill="#000000"
              style={{fontSize: '10px', alignmentBaseline: 'middle', fontFamily: '"Helvetica Neue", HelveticaNeue, HelvRegularIBM, Helvetica, Arial, sans-serif'}}>
              {name}
            </text>
          </g>)
        }
        )}

{/*        <g><line x1={117} x2={107} y1="310.2" y2="334.2" fill="none" stroke="#aba7a7" style={{strokeWidth: 3, strokeLinecap: 'round'}} /><text x={100} y="315.2" fill="#000000" style={{fontSize: '11px'}}>5</text></g>
*/}
      </g>
    )
  }

  renderGrid = () => {
    const { qregs, highlightRegPos, isShowEditMode } = this.state;

    var cols = [];
    const display = this.state.isShowEditMode ? 'flex' : 'none';

    for (var i = 0; i < 20; ++i) {
      var col = [];
      const x = 150 + i * 60;

      qregs.forEach((reg, ind) => {
        const y = 65 + ind * 48;

        let color = "#616161"
/*        if (isShowEditMode && highlightRegPos && highlightRegPos[0] == i
          && reg.type == 'QUANTUM'
          ) {
          color = "#000"
        }
*/
        col.push(<circle key={x + '_' + y} cx={x} cy={y}  fill={color}  r={4} />);
      })

      cols.push(
        <g key={i} style={{display: display}} >
          {col}
        </g>
      )
    }

    return (
      <g>
        {cols}
      </g>
    )
  }

  renderVerticalHighlight = () => {
    const { qregs, highlightRegPos, isShowEditMode } = this.state;

    if (isShowEditMode && highlightRegPos && qregs.length > highlightRegPos[1]
      && qregs[highlightRegPos[1]].type == 'QUANTUM') {

      let x = 150 + highlightRegPos[0] * 60;
      const y0 = 65 + 0 * 48, y1 = 65 + qregs.length * 48
      let color = green[200]

      if (highlightRegPos[2] == 'middle') {
        x -= 30;
        color = grey[200];
      }
      return (
        <line x1={x} x2={x} y1={y0} y2={y1} fill="none" stroke={color} style={{strokeWidth: 3, strokeLinecap: 'round'}} />
      )
    }

    return ""
  }

  renderQLines = () => {
    const { qregs, highlightRegPos, isShowEditMode } = this.state;

    var res = [];
    qregs.forEach((reg, ind) => {
      const y = 65 + ind * 48
      let color = reg.type == 'CLASSIC' ? lime[400] : green[400];
      if (isShowEditMode && highlightRegPos
        && highlightRegPos[1] == ind && reg.type == 'QUANTUM')
        {
          color = green[800];
        }

      res.push(<line key={"line_" + ind} x1={0} x2={3164} y1={y} y2={y} fill="none" stroke={color} style={{strokeWidth: 3, strokeLinecap: 'round'}} />);
    })
/*
    const y = 65 + qregs.length * 48;
    res.push(<line key="line_tl" x1={105} x2={5580} y1={y} y2={y} fill="none" stroke="#aba7a7" style={{strokeWidth: 3, strokeLinecap: 'round'}} />);
*/
    return res
  }

  calcSvgCoords = (gridX, gridY) => [ 130 + gridX * 60, 45 + gridY * 48 ];

  calcGridCoordsByOuterCoords = (x, y) => {
    // x:  97 -> 120 (0), 831 -> 1020(15)
    // y:  483 -> 232 (4),365 -> 88 (1)

//    const innerX = (x + 395) * this.SVGratio
//    const innerY = (y - 120) * this.SVGratio

    const innerX = (x + 190) * this.SVGratio
    const innerY = (y - 80) * this.SVGratio

    return this.calcGridCoordsByInnerCoords(innerX, innerY)
  }

  calcGridCoordsByInnerCoords = (innerX, innerY) => {
    var ret = [], closestD = 1000
    const { qregs } = this.state;

    qregs.forEach((reg, ind) => {
      for (var ix = 0; ix < 20; ++ix) {
        const svg = this.calcSvgCoords(ix, ind)
        const D = Math.abs(innerX - svg[0]) + Math.abs(innerY - svg[1])

        if (D < 50 && D < closestD) {
          closestD = D
          ret = [ix, ind]

          const dx = svg[0] - innerX
          if (dx > 20) ret.push('middle')
        }
      }
    })

    return ret
  }

  renderBlocksPalette = () => {
    const { classes, windowWidth, windowHeight, currentBlockName,
      isReadOnly, isQControl, } = this.props;

    return (
    <Card className={classes.newBlocks}>
      <CardContent>
        {isReadOnly ?
          <span style={{display: 'flex', justifyContent: 'center',}}>
            Quantum circuit editor is in read-only mode. Select Target -> Quantum circuit to edit circuit.
          </span> :
        palette.map((paletteLine, lineNum) =>
          paletteLine.filter(blockType => !isQControl || blockType != 'Measure').map((blockType, blockColNum) =>
            <svg className="draggable" key={this.state.randomSeed + lineNum + "_" + blockColNum}
              style={{position: 'absolute', top: 10 + lineNum * 50, left: 10 + blockColNum * 50, width: 50, height: 50, zIndex: 99}}
              viewBox="0 0 48.876 48.876" data-block-type={blockType}>
              <g transform="matrix(1,0,0,1,5,5)">
                {blocksJSX[blockType]({})}
              </g>
            </svg>
        ))
        }


      </CardContent>
    </Card>
    )
  }



  onBlockClick = (blockId) => event => {
    event.stopPropagation()

    if (this.props.isReadOnly) return

    this.setState({
      selectedBlock: blockId,
      isShowEditMode: false,
      blockEditCtrls: null,
    })

    const blockParams = this.state.blocks.filter(block => block.id == blockId)[0]

//    this.props.onBlockSelected(blockId, blockParams, this.onBlockParamChanged)
  }

  onBlockParamChanged = (blockId, paramName, paramValue) => {
    this.setState({
      blocks: this.state.blocks.map(block => {
        if (block.id == blockId) {
          block[paramName] = paramValue
        }
        return block
      })
    })

    this.demandSaveChanges()
  }

  renderBlockCtrls = (block) => {
    var ret = []

    block.ctrls && block.ctrls.forEach(ctrl => {
      const [x1, y1] = [20, 20]
      const [x2, y2] = [x1, y1 + (ctrl - block.pos[1]) * 48]

      ret.push(<line key={block.id + '_ctrl_' + x1 + '_' + y1 + '_' + x2 + '_' + y2} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={'blue'} strokeWidth="4"
      />)

      ret.push(<circle key={block.id + '_ctrl_' + y2}  cx={x2} cy={y2} r="6" fill="blue"></circle>)
    })


    return (
      <g>
        {ret}
      </g>
    )
  }

  renderPairedBlockConnection = (block) => {
    if (block.pairedByY || !this.isPairedBlockType(block.type) ||
      this.state.ghostPairedBlockId == block.id || block.id == null) return ""

    const gapWidth = 5
    const [x1, y1] = [20 - gapWidth, 20]
    const [x2, y2] = [x1, y1 + (block.pairedY - block.pos[1]) * 48]
    const [x1_, y1_] = [x1 + 2 * gapWidth, y1]
    const [x2_, y2_] = [x2 + 2 * gapWidth, y2]
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={'green'} strokeWidth="3"
        />
        <line x1={x1_} y1={y1_} x2={x2_} y2={y2_}
          stroke={'green'} strokeWidth="3"
        />
      </g>
    )
  }

  _renderRegularBlock = (block, ind) => {
    const { blocks, randomSeed, selectedBlock,  } = this.state;
    const { classes, isReadOnly, } = this.props;

    let [x, y] = this.calcSvgCoords(block.pos[0], block.pos[1]);
    if (block.pos[2] == 'middle') x -= 25

    const Block = blocksJSX[block.type];
    return (
      <g key={randomSeed + '_' + ind}
         className={classNames(isReadOnly ? "" : "svg_draggable")}
         transform={"matrix(1,0,0,1,"+x+","+y+")"}
         data-x={x} data-y={y} data-block-id={block.id} data-paired-by-y={block.pairedByY}
      >
        {this.renderBlockCtrls(block)}
        {this.renderPairedBlockConnection(block)}

        <Block className={selectedBlock == block.id ? classes.block_selected : ''}
          onClick={this.onBlockClick(block.id)} />
      </g>
    )
  }

  renderBlocks = () => {
    var res = []

    const { blocks, randomSeed, selectedBlock } = this.state;
    const { classes, } = this.props;

    blocks.forEach((block, ind) => {
      if (this.isPairedBlockType(block.type)) {
        if (this.state.ghostPairedBlockId != block.id || !this.state.movementIsPairedByY) {
          res.push(this._renderRegularBlock(block, ind))
        }
        if (this.state.ghostPairedBlockId != block.id || this.state.movementIsPairedByY) {
          res.push(this._renderRegularBlock({...block,
            pos: [block.pos[0], block.pairedY],
            ctrls: [],
            pairedByY: true,
          }, ind + "pair"))
        }
      } else {
        res.push(this._renderRegularBlock(block, ind))
      }
    })

    if (this.state.ghostPairedCoords && this.state.ghostPairedBlockType) {
      res.push(this._renderRegularBlock({
        type: this.state.ghostPairedBlockType,
        pos: this.state.ghostPairedCoords,
        ctrls: [],
      }, ''))
    }

    return res
  }

  toggleCtrlForBlock = (blockId, ctrlId) => {
    const { blocks } = this.state;

    const newBlocks = blocks.map(block => {
      if (block.id != blockId) return block

      const ind = block.ctrls.indexOf(ctrlId)
      var ctrls = [...block.ctrls]

      if (ind == -1) {
        ctrls.push(ctrlId)
      } else {
        ctrls.splice(ind, 1)
      }

      return {...block, ctrls}
    })

    this.setState({blocks : newBlocks})
  }

  onSVGClick = (event) => {
    const { blockEditCtrls } = this.state;

    this.setState({
      selectedBlock: null,
    })

//    this.props.onBlockSelected(null)

    if (blockEditCtrls) {
      const translatedY = event.clientY - this.svg.getBoundingClientRect().y + 70 // - 181

      const grid = this.calcGridCoordsByOuterCoords(300, translatedY)
      if (grid.length > 0) {
        this.toggleCtrlForBlock(blockEditCtrls, grid[1])
        this.demandSaveChanges()
      }
    }
  }

  onStopCtrlsEdit = () => {
    this.setState({
      isShowEditMode: false,
      blockEditCtrls: null,
    })
  }

  onStartCtrlsEdit = () => {
    const { selectedBlock, blockEditCtrls, blocks } = this.state;

    const newBlocks = blocks.map(block => {
      if (block.id != selectedBlock) return block

      return {...block, ctrls: []}
    })

    this.setState({
      blockEditCtrls: selectedBlock,
      isShowEditMode: true,
      blocks: newBlocks,
    })
  }

  compileQSchemaFromState = () => {
	  let maxX = 0, maxY = this.state.qregs.length;
	  this.state.blocks.forEach(block => {
		  maxX = Math.max(maxX, block.pos[0])
	  })

	  var result = []
	  for (let y = 0; y < maxY; y++) {
		  var arr = []
		  for (let x = 0; x < maxX; x++) {
			  arr.push("")
		  }
		  result.push(arr)
	  }

	  this.state.blocks.forEach(block => {
  		let s = block.type
      if (this.isPairedBlockType(block.type)) {
        s += ':' + block.pairedY
      }
      if (['Rx', 'Ry', 'Rz'].indexOf(block.type) != -1) {
        s += '(' + parseFloat(block.angle) + ')'
      }
      if (block.ctrls.length) {
  			s += '-' + block.ctrls.join(',')
  		}
  		result[block.pos[1]][block.pos[0]] = s;
	  })

  	  this.props.comm.send({ action: 'save_schema', qschema: result });
  	  this.props.cell._metadata._hiq_info.qschema = result
  	  this.props.cell._metadata._hiq_info.qregs = this._inited_from_qreg_data
  	  console.log('saved metadata:', this.props.cell._metadata)

	  return result
  }

  renderAnglePanel = () => {
    const { selectedBlock, blockEditCtrls, qregs } = this.state;
    if (!selectedBlock) return ""

    const { pos, type, angle } = this.getBlockById(selectedBlock)
    const selectedParamBlock = selectedBlock && ['Rx', 'Ry', 'Rz'].indexOf(type) != -1

    if (!selectedParamBlock) return ""

    const [x, y] = this.calcSvgCoords(pos[0], pos[1])

    const onChange = (e) => {
        e.stopPropagation();
        e.preventDefault();

        let block = {...this.getBlockById(selectedBlock),

            angle: e.target.value
        }


        this.setState({
            blocks: [...this.state.blocks,
                block
            ],
        })
    }

    return (
        <Card style={{
            position: 'absolute',
            width: 120,
            height: 100,
            left: x - 30,
            top: y + 100,
            zIndex: 99,
        }}>
          <CardContent>
            <TextField
              label="Rotation angle"
              //className={classes.textField}
              value={Number.isNaN(angle) || angle =="NaN" ? "" : angle}
              onChange={onChange}
              margin="normal"
            />
          </CardContent>
        </Card>
    )
  }

  render() {
    const { classes, windowWidth, windowHeight, currentBlockName,
      isIDE, isQControl, left, top, } = this.props;
    const { selectedBlock, blockEditCtrls, qregs } = this.state;

    const selectedNonMeasureBlock = selectedBlock && this.getBlockById(selectedBlock).type != 'Measure'
    const editorHeight = 48 * qregs.length + 40

    /*if (currentBlockName != 'root') {
      return (
        <BlockDetailed
          currentBlockName={currentBlockName}
          onRef={this.onBlockDetailedRef}
        />
      )
    }*/

    return (
      <Card className={classes.container} id={this.state.mainContainerId}>
        <CardContent>

        {this.renderBlocksPalette()}

        {this.renderAnglePanel()}

        {blockEditCtrls ?
          <Button  color="secondary"
            onClick={this.onStopCtrlsEdit} style={{left: 500, top: 110, position: 'absolute', zIndex: 99}}>
            Stop Edit mode
          </Button>
        : selectedNonMeasureBlock &&
          <Button  color="primary"
            onClick={this.onStartCtrlsEdit} style={{left: 500, top: 110, position: 'absolute', zIndex: 99}}>
            Edit controls
          </Button>
        }

        <div
           style={{
            width: '1100px', height: editorHeight, position: 'relative', overflow: 'hidden', paddingTop: '10px'
          }} className="drop-container drag-over-add" drop-container="true">
                <svg ref={svg => this.svg = svg} style={{
                    backgroundColor: '#fff', position: 'absolute', top: 0, left: 0,
                    width: '1100', height: editorHeight
                  }} height="100%" width="100%"
                  onClick={this.onSVGClick}
                >
                  <defs>
                    <clipPath id="scrollArea1">
                      <rect id="scrollArea1-rect" x={100} y={0} width={960} height={editorHeight} />
                    </clipPath>
                  </defs>
                  <g><g style={{opacity: 0, display: 'none'}} transform="matrix(1,0,0,1,115,2)">
                      <g>
                        <rect x={0} fill="#CE7C7C" width="89.25" height="26.186" />
                      </g>
                    </g>


                    {this.renderLabels()}
{/*                      <g transform="matrix(1.7,0,0,1.7,66.7613,315.7739)"><g id="gSjpf81cb2lj" transform="matrix(1,0,0,1,12.422,0)">
                        <path d="M4.189,4.454c0-0.797-0.047-1.594-0.393-2.328C3.346,1.158,2.518,1,2.109,1C1.5,1,0.782,1.267,0.359,2.188
              		C0.048,2.876,0,3.658,0,4.455c0,0.75,0.032,1.641,0.454,2.405c0.422,0.797,1.155,1,1.644,1c0.529,0,1.297-0.203,1.731-1.156
              		c0.312-0.692,0.36-1.47,0.36-2.253V4.454z M2.098,7.641c-0.393,0-0.981-0.25-1.156-1.203C0.835,5.844,0.835,4.922,0.835,4.331
              		c0-0.642,0-1.297,0.078-1.828c0.188-1.188,0.938-1.28,1.188-1.28c0.33,0,0.982,0.187,1.172,1.17
              		c0.107,0.562,0.107,1.312,0.107,1.94c0,0.75,0,1.42-0.107,2.06C3.114,7.346,2.553,7.641,2.1,7.641H2.098z" />
                      </g>
                      <text x={0} y={2} fill="#000000" style={{fontSize: '10px', alignmentBaseline: 'middle', fontFamily: '"Helvetica Neue", HelveticaNeue, HelvRegularIBM, Helvetica, Arial, sans-serif'}}>c</text></g>
*/}
                      </g>
                  <g id="scrollingArea" clipPath="url(#scrollArea1)">
                    <g>
                      <g>
                        {this.renderGrid()}
                        {this.renderVerticalHighlight()}
                      </g>

                      {this.renderQLines()}
                    </g>
                    {this.renderBlocks()}
                  </g>
                </svg>
              </div>

        </CardContent>
      </Card>
    )
  }
}

export function mapDispatchToProps(dispatch) {
  return {

  };
}

const mapStateToProps = createStructuredSelector({

});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const composed = compose(
  withConnect
)(QuantumCircuit);


export default withStyles(styles)(QuantumCircuit)
