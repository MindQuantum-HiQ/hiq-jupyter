// Base component that handles comm messages and renders components to notebook cell
import React from 'react';
import autobind from 'autobind-decorator';


@autobind
class Component extends React.Component {

  constructor( props ) {
    super( props );
	const { comm_msg, } = props;	
    this.state = {
      renderProps: null,//{ ...props, ...comm_msg.content.data }
    };
	
	console.log('PROPS:', props);
	
    props.comm.on_msg( this.handleMsg );
  }

  /**
   * handleMsg 
   * Handle all messages over this comm
   */
  handleMsg( msg ) {
	  
    const { comm_msg, save, additional } = this.props;
	console.log('handled Msg:', msg)
    const { method, props = {} } = msg.content.data;
    if ( method === "update" ) {
      if ( this.props.on_update ) {
        return this.props.on_update( comm_msg.content.data.module, props, msg.content.comm_id, ...additional);
      }
      this.setState( { renderProps: { ...props, ...comm_msg.content.data, ...additional } } );
    } else if ( method === "display" ) {
      console.log('method === "display"', msg, comm_msg, save )
      if ( save ) {
        this._save( msg, comm_msg.content.comm_id, () => {
          this.setState( { renderProps: { ...props, ...comm_msg.content.data, ...additional } } );
        } );
      } else {
        this.setState( { renderProps: { ...props, ...comm_msg.content.data, ...additional } } );
      }
    } else if (msg.content.data.action == "set_circuit") {
		this.setState( { renderProps: { ...props, ...msg.content.data, ...additional } } );
	}
  }

  // saves the index of the cell to the notebook metadata
  // useful for components that want to re-render on page refresh
  _save( msg, comm_id, done ) {
	console.log('_save:', msg, comm_id)
    const cell = this._getMsgCell( msg );
    const md = Jupyter.notebook.metadata;
    if ( cell ) {
      if ( !md.react_comms ) {
        md.react_comms = {}
      }
      md.react_comms[ comm_id ] = {
		  cellIdx: this._getCellIndex( cell.cell_id ) + '', 
		  msg: msg
	  };
	  
	  if (!cell._metadata._hiq_info) cell._metadata._hiq_info = {}
	  cell._metadata._hiq_info = {...cell._metadata._hiq_info,
		  msg, comm_id,
	  }
    }
    done();
  }

	 /**
	 * _getCellIndex
	 * gets the index of a cell_id in the notebook json 
	 */
	_getCellIndex( cell_id ) {
	  let idx;
	  Jupyter.notebook.get_cells().forEach( function( c, i){
		if ( c.cell_id === cell_id ) {
		  idx = i;
		}
	  });
	  return idx;
	}
	
	_getMsgCell( msg ) {
      if ( this.cell ) return this.cell;
      const msg_id = msg.parent_header.msg_id;
      this.cell = Jupyter.notebook.get_msg_cell( msg_id );
      this._overrideClearOutput();
      return this.cell;
    }
	
	_overrideClearOutput() {
		return
      this.cell.clear_output = () => {
        Object.getPrototypeOf ( this.cell ).clear_output.call( this.cell )
        this.cell.react_dom.clear();
      };
    }

  render() {
    const { 
      state: { renderProps },
      props: { 
        comm_msg,
        comm,
        components 
      } 
    } = this;

	
	console.log('render() in component.js:', components[ comm_msg.content.data.module ], comm_msg.content.data.module)

    return ( 
      <div>
        { renderProps && comm_msg && React.createElement( components[ comm_msg.content.data.module ], { comm, ...renderProps } ) }
      </div>
    );
  };

};

export default Component;
