import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
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
import TextField from '@material-ui/core/TextField';
import { blocksJSX, blocksConfig, palette } from './quantumBlocks';


const styles = theme => ({
  draggable: {
    position: 'absolute',
  },
  block_selected: {
    outline: '4px solid #BBB',
  },
  newBlocks: {
    width: 320,
    height: 60,
    left: 400,
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
  },
  
  qstateBottomSchema: {
    marginBottom: 0,
    fontSize: 16,
  },

});

const doubleClickTimeWindowMs = 500;



class QuantumCircuit extends React.PureComponent {

  state = {
    selectedBlock: null,
    lastClickTime: null,
    blockEditCtrls: null,

    isShowEditMode: false,
    randomSeed: Math.random(),

    qregs: [
      {name: 'classic1', type: 'CLASSIC'},
      {name: 'ancilla', type: 'QUBIT'},
      {name: 'qureg[0]', type: 'QUBIT'},
      {name: 'qureg[1]', type: 'QUBIT'},
      {name: 'qureg[2]', type: 'QUBIT'},
      {name: 'qureg[3]', type: 'QUBIT'},
    ],

    blocks: [
/*      
      {type: 'X', id: 1, pos: [3, 2], ctrls: [0, 3]},
      {type: 'Y', id: 2, pos: [0, 4], ctrls: []},
      {type: 'T', id: 3, pos: [7, 2], ctrls: []},
*/    ]
  };

	SVGratio = 1

  constructor() {
    super()

    this.canvas = document.createElement("canvas")
    this.canvasContext = this.canvas.getContext("2d")
    this.canvasContext.font = "16px Times New Roman";
  }
  
  componentDidMount() {
    let blockName = '';

    this.initInteractForNewBlocks()
    this.initInteractForExistingBlocks()
	
	this.initStateFromPropsData()
	this.initQRegsFromPropsData()
	this.props.comm.on_msg(this.commMessagesHandler)
  }
  
  initStateFromPropsData = (circuitData) => {
	var blocks = []
	
	if (!circuitData) circuitData = this.props.circuit;
	  
	if (circuitData) {
	  circuitData.forEach((line, row) => {
		line.forEach((blockEncoded, col) => {
		  if (blockEncoded) {
			const [gateType, ctrlsEncoded] = blockEncoded.split('-')
			const ctrls = ctrlsEncoded ? ctrlsEncoded.split(',') : []
			
			blocks.push({
			  type: gateType,
			  id: blocks.length + 1,
			  pos: [col, row],
			  ctrls: ctrls,
			})
  		  }
		})
	  })
	}
	
	this.setState({blocks})
  }

  initQRegsFromPropsData = (qregsData) => {
    if (!qregsData) qregsData = this.props.qregs

    if (qregsData) {
        var qregs = []

        qregsData.forEach((reg, j) => {
            if (reg.type == 'QUREG') {
                for (let i = 0; i < reg.size; i++) {
                    qregs.push({ name: `${reg.name}[${i}]`, type: 'QUBIT' })
                }
            } else {
                qregs.push(reg)
            }
        })

      this.setState({ qregs })
    }
  }
  
  commMessagesHandler = (msg) => {	
	if (msg.content && msg.content.data) {
	  const data = msg.content.data
	  console.log(data)
	  
	  switch (data.action) {
	    case 'set_gate':
		  this.commSetGate(data)
		  break
		  
		case 'set_circuit':
		  this.commSetCircuit(data)
		  break
	  }
	}
  }
  
  commSetCircuit = (data) => {
	this.initStateFromPropsData(data.set_circuit);
  }
  
  commSetGate = (data) => {	
	const mutation = () => {
		if (data.gateEncoded.length == 0) {
			return
		} else {
			const [gateType, ctrlsEncoded] = data.gateEncoded.split('-')
			const gridCoords = [data.col, data.row]
			
			this.processCreationOfNewBlock(gateType, gridCoords, ctrlsEncoded)
		}
	}
	
    const blockId = this.findBlockByPos(data.col, data.row)
	if (blockId) {
		this.setState({
			blocks: this.state.blocks.filter(block => block.id != blockId)
		}, mutation)
	} else {
		mutation()
	}
  }
  
  initInteractForNewBlocks = () => {
    interact('.draggable')
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
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          event.target.style.webkitTransform =
          event.target.style.transform =
              'translate(' + x + 'px, ' + y + 'px)';

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);

          console.log(this)
          if (!this.state.isShowEditMode) {
            this.onStartDrag()
          }
        },
        onend: (event) => {

          const target = event.target,
              x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
              blockType = (target.getAttribute('data-block-type'));


          const originalX = parseInt(target.style.left), originalY = parseInt(target.style.top) + 50

          this.onCreateNewBlock(blockType, x + originalX, y + originalY)
        }
      });
  }

  initInteractForExistingBlocks = () => {
    interact('.svg_draggable')
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
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy * this.SVGratio;

          event.target.style.webkitTransform =
          event.target.style.transform =
              "matrix(1,0,0,1,"+x+","+y+")";

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);

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

  onCreateNewBlock = (blockType, x, y, ctrlsEncoded) => {
    console.log(x, y)

    const gridCoords = this.calcGridCoordsByOuterCoords(x, y)
    if (gridCoords.length) {
	  this.processCreationOfNewBlock(blockType, gridCoords, ctrlsEncoded)
    }

    this.setState({
      isShowEditMode: false,
      randomSeed: Math.random(),
	  qseed: Math.random()
    })
  }
  
  processCreationOfNewBlock = (blockType, gridCoords, ctrlsEncoded) => {
	  	  
	  const ctrls = ctrlsEncoded ? ctrlsEncoded.split(',') : []
	  const err = this.validateBlockMovement(gridCoords, ctrls)
	  
	  if (!err) {
		
		  const { blocks } = this.state;
		  const newId = blocks.reduce((acc, block) => Math.max(acc, block.id), 0) + 1

		  this.setState({
			blocks: [...blocks, {
			  type: blockType,
			  id: newId,
			  pos: gridCoords,
			  ctrls: ctrls,
			}]
		  })
	  } else {
		  console.log(err)
	  }
  }
  
  validateBlockMovement = (newPos, newCtrls, id) => {
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
	
	this.state.blocks.forEach((block) => {
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
    const ret = this.calcGridCoordsByInnerCoords(innerX, innerY)

    if (ret.length == 0) {
      this.setState({
        blocks: this.state.blocks.filter(block => block.id != blockId)
      })
    } else {
      const err = this.validateBlockMovement(ret, [], blockId)
	  
	  if (!err) {
		
		  this.setState({
			blocks: this.state.blocks.map(block => {
			  if (block.id != blockId) return block

			  return {...block, pos: ret}
			})
		  })
	  } else {
		console.log(err)  
	  }

    }

    this.setState({
      isShowEditMode: false,
      randomSeed: Math.random(),
    })
  }

  renderLabels = () => {
    const { qregs } = this.state;

    return (

      <g transform="matrix(1.7,0,0,1.7,44.9724,57.1587)">
        {qregs.map((reg, ind) =>
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
            <text x={0} y={5 + ind * 28} fill="#000000" style={{fontSize: '10px', alignmentBaseline: 'middle', fontFamily: '"Helvetica Neue", HelveticaNeue, HelvRegularIBM, Helvetica, Arial, sans-serif'}}>{reg.name}</text>
          </g>
        )}

{/*        <g><line x1={117} x2={107} y1="310.2" y2="334.2" fill="none" stroke="#aba7a7" style={{strokeWidth: 3, strokeLinecap: 'round'}} /><text x={100} y="315.2" fill="#000000" style={{fontSize: '11px'}}>5</text></g>
*/}
      </g>
    )
  }

  renderGrid = () => {
    const { qregs } = this.state;

    var cols = [];
    const display = this.state.isShowEditMode ? 'flex' : 'none';

    for (var i = 0; i < 20; ++i) {
      var col = [];
      const x = 150 + i * 60;

      qregs.forEach((reg, ind) => {
        const y = 65 + ind * 48;

        col.push(<circle key={x + '_' + y} cx={x} cy={y}  fill="#414141"  r={4} />);
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

  renderQLines = () => {
    const { qregs } = this.state;

    var res = [];
    qregs.forEach((reg, ind) => {
      const y = 65 + ind * 48
      const color = reg.type == 'CLASSIC' ? lime[400] : green[400];

      res.push(<line key={"line_" + ind} x1={0} x2={5580} y1={y} y2={y} fill="none" stroke={color} style={{strokeWidth: 3, strokeLinecap: 'round'}} />);
    })

    const y = 65 + qregs.length * 48;
    res.push(<line key="line_tl" x1={105} x2={5580} y1={y} y2={y} fill="none" stroke="#aba7a7" style={{strokeWidth: 3, strokeLinecap: 'round'}} />);

    return res
  }

  calcSvgCoords = (gridX, gridY) => [ 130 + gridX * 60, 45 + gridY * 48 ];

  calcGridCoordsByOuterCoords = (x, y) => {
    // x:  97 -> 120 (0), 831 -> 1020(15)
    // y:  483 -> 232 (4),365 -> 88 (1)

    const innerX = (x + 395) * this.SVGratio
    const innerY = (y - 120) * this.SVGratio

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
        }
      }
    })

    return ret
  }

  renderBlocksPalette = () => {
    const { classes, windowWidth, windowHeight, currentBlockName } = this.props;

    return (
    <Card className={classes.newBlocks}>
      <CardContent>

        {palette.map((paletteLine, lineNum) =>
          paletteLine.map((blockType, blockColNum) =>
            <svg className="draggable" key={this.state.randomSeed + lineNum + "_" + blockColNum}
              style={{position: 'absolute', top: 10 + lineNum * 50, left: 10 + blockColNum * 50, width: 50, height: 50, zIndex: 1000}}
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

    this.setState({
      selectedBlock: blockId,
      isShowEditMode: false,
      blockEditCtrls: null,
    })

//    this.props.onBlockSelected(blockId)
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

  renderBlocks = () => {
    var res = []

    const { blocks, randomSeed, selectedBlock } = this.state;
    const { classes, } = this.props;

    blocks.forEach((block, ind) => {
      const [x, y] = this.calcSvgCoords(block.pos[0], block.pos[1]);

      const Block = blocksJSX[block.type];

      res.push(
        <g key={randomSeed + '_' + ind}
           className={classNames("svg_draggable")}
           transform={"matrix(1,0,0,1,"+x+","+y+")"}
           data-x={x} data-y={y} data-block-id={block.id}
        >
          {this.renderBlockCtrls(block)}

          <Block className={selectedBlock == block.id ? classes.block_selected : ''}
            onClick={this.onBlockClick(block.id)} />
        </g>
      )
    })

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
      const translatedY = event.clientY - 181 + 50

      const grid = this.calcGridCoordsByOuterCoords(300, translatedY)
      if (grid.length > 0) {
        this.toggleCtrlForBlock(blockEditCtrls, grid[1])
      }
    }
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
	  let maxX = 1, maxY = this.state.qregs.length;
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
		if (block.ctrls.length) {
			s += '-' + block.ctrls.join(',')
		}
		result[block.pos[1]][block.pos[0]] = s;  
	  })

	  this.props.comm.send({ qschema: result });
	  
	  return result
  }

  render() {
    const { classes, windowWidth, windowHeight, currentBlockName } = this.props;
    const { selectedBlock, blockEditCtrls } = this.state;

    /*if (currentBlockName != 'root') {
      return (
        <BlockDetailed
          currentBlockName={currentBlockName}
          onRef={this.onBlockDetailedRef}
        />
      )
    }*/
	
	const qschema = JSON.stringify(this.compileQSchemaFromState());
	if (qschema != this.tmp) {
		this.tmp = qschema;
		
//		this.props.comm.send({ qschema });
	}
	console.log(this.props);

    return (
      <Card className={classes.card}>
        <CardContent>

        {this.renderBlocksPalette()}

        {blockEditCtrls ?
          <Button mini color="secondary" disabled
            onClick={()=>{}} style={{left: 500, top: 160, position: 'absolute', zIndex: 10000}}>
            Edit mode
          </Button>
        : selectedBlock &&
          <Button mini color="primary"
            onClick={this.onStartCtrlsEdit} style={{left: 500, top: 160, position: 'absolute', zIndex: 10000}}>
            Edit controls
          </Button>
        }

        <div id="visualQasm1-container"
           style={{
            width: '1100px', height: '400px', position: 'relative', overflow: 'hidden', paddingTop: '10px'
          }} ng-if="topology" is-editable="true" topology="topology" width="playgroundWidth"
          show-dots="showDots" show-linkable-lines="showLinkableLines" gates-matrix="commandsMatrix"
          is-real-device="isRealDevice" className="drop-container drag-over-add" drop-container="true">
                <svg id="visualQasm1" style={{
                    backgroundColor: '#fff', position: 'absolute', top: 0, left: 0,
                    width: '1100', height: '400'
                  }} viewBox="0 0 1100 404.2" height="100%" width="100%"
                  onClick={this.onSVGClick}
                >
                  <defs>
                    <clipPath id="visualQasm1-scrollableAreaClipPath">
                      <rect id="visualQasm1-scrollableAreaClipPath-rect" x={100} y={0} width={960} height="404.2" />
                    </clipPath>
                  </defs>
                  <g id="visualQasm1-fixedGroup"><g id="Layer_2" style={{opacity: 0, display: 'none'}} transform="matrix(1,0,0,1,115,2)">
                      <g id="background">
                        <rect x={0} fill="#CE7C7C" width="89.25" height="26.186" />
                      </g>
                      <g>
                        <g id="miu_1_">
                          <g id="Artboard-1_1_" transform="translate(-899.000000, -479.000000)">
                            <g id="slice_1_" transform="translate(215.000000, 119.000000)">
                            </g>
                            <path id="editor-trash-delete-recycle-bin-glyph_1_" fill="#FFFFFF" d="M908.365,484.468c0,0-0.408,0-0.408,0.737
              					c0,0.737,0.408,0.737,0.408,0.737h14.603c0,0,0.406,0,0.406-0.737c0-0.737-0.406-0.737-0.406-0.737H908.365L908.365,484.468z
              					 M908.747,486.682h13.79l-1.623,13.277h-10.545L908.747,486.682z M914.428,483.731c-0.811,0-0.811,0.737-0.811,0.737h4.057
              					c0,0,0-0.737-0.812-0.737H914.428L914.428,483.731z M912.804,498.484h0.812l-0.812-11.83h-0.811L912.804,498.484z
              					 M918.484,486.655l-0.811,11.83h0.811l0.812-11.83H918.484L918.484,486.655z M915.239,486.655v11.83h0.811v-11.83H915.239
              					L915.239,486.655z" />
                          </g>
                        </g>
                        <text transform="matrix(1 0 0 1 30.3997 18.3564)" fill="#FCFCFC" fontFamily="'Helvetica Neue','HelveticaNeue','Helvetica',Arial,sans-serif" fontSize="18.7013">Delete</text>
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
                  <g id="visualQasm1-scrollingArea" clipPath="url(#visualQasm1-scrollableAreaClipPath)">
                  <g id="visualQasm1-playground">
                    <g>
                      {this.renderGrid()}
                    </g>
                  {this.renderQLines()}

                  </g>
                    <g id="visualQasm1-gates" ng-transclude="gates">
                      {this.renderBlocks()}
                    </g>
                  </g>
                  <g id="visualQasm1-scroll" ng-transclude="scroll">
                    <g >
/*                      <g id="visualQasm1-leftShadow" transform="matrix(1,0,0,1,100,25)" style={{display: 'none'}}>
                        <linearGradient id="visualQasm1-SVGID_3_" gradientUnits="userSpaceOnUse" x1={-20} y1="25.0195" x2={20} y2="25.0195">
                          <stop offset={0} style={{stopColor: '#2A2A2B'}} />
                          <stop offset="0.6292" style={{stopColor: '#FFFFFF', stopOpacity: 0}} />
                        </linearGradient>
                        <line fill="none" stroke="url(#visualQasm1-SVGID_3_)" strokeWidth={9} strokeMiterlimit={10} x1={0} y1={0} x2={0} y2="339.2" />
                      </g>
                      <g id="visualQasm1-rightShadow" transform="matrix(1,0,0,1,1060,25)">
                        <linearGradient id="visualQasm1-SVGID_4_" gradientUnits="userSpaceOnUse" x1={-10} y1="25.0195" x2={40} y2="25.0195">
                          <stop offset={0} style={{stopColor: '#FFFFFF', stopOpacity: 0}} />
                          <stop offset="0.6292" style={{stopColor: '#2A2A2B'}} />
                        </linearGradient>
                        <line fill="none" stroke="url(#visualQasm1-SVGID_4_)" strokeWidth={9} strokeMiterlimit={10} x1={0} y1={0} x2={0} y2="339.2" />
                      </g>
*/
                    </g>
                  </g>
                  <g display="none">
                    <text transform="matrix(1 0 0 1 12 10)" fontFamily="'MyriadPro-Regular'" fontSize={16} />
                    <text transform="matrix(1 0 0 1 0 10)" fontFamily="'MyriadPro-Regular'" fontSize={16}>-</text>
                    <text transform="matrix(1 0 0 1 24 10)" fontFamily="'MyriadPro-Regular'" fontSize={16}>+</text>
                  </g>
                </svg>
              </div>

			{/*
			<Typography className={classes.qstateBottomSchema} color="textPrimary">
				{qschema}
			</Typography> */}

        </CardContent>
      </Card>
    )
  }
}


const mapStateToProps = createStructuredSelector({

});

export function mapDispatchToProps(dispatch) {
  return {
    
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const composed = compose(
  withConnect
)(QuantumCircuit);


export default withStyles(styles)(QuantumCircuit)
