import Backbone from 'backbone';
import React from 'react';
import ReactDOM from 'reactdom';
import Main from 'view/main';

'use strict';

export default class Index extends Backbone.View {

    render() {
        ReactDOM.render(<Main />, this.el);
        return this;
    }
}
