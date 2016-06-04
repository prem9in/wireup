import React from 'react';
import Base from 'view/base';
import count from 'model/count';

'use strict';

export default class Main extends Base {

	constructor(options) {
        super(options);
		this.state = { countModel: count };
		this.registerForChange(this.state.countModel);
		this.registerForFetch(this.state.countModel);
    }

    increase() {
    	let newValue = this.state.countModel.get("value") + 1;
    	this.state.countModel.set({value: newValue});
    }

    decrease() {
    	let newValue = this.state.countModel.get("value") - 1;
    	this.state.countModel.set({value: newValue});
    }

    render() {
        return (
        	<div className="main">
	            <div className="greet">
	                {this.props.resources.getString("GreetMsg")}
				</div>
				<div className="valueLabel">
					 <div className="col-sm-7">{this.props.resources.getString("CountLabel")} </div>
					 <div className="col-sm-5">{this.state.countModel.get("initialized") == true ? this.state.countModel.get("value") : this.props.resources.getString("LoadingMsg")}
					 </div>
				</div>
				<div>
					<input type="button" onClick={this.increase.bind(this)} value={this.props.resources.getString("IncreaseMsg")} />
					&nbsp;&nbsp;
					<input type="button" onClick={this.decrease.bind(this)} value={this.props.resources.getString("DecreaseMsg")} />
				</div>
			</div>
        );
    }
}
