import _ from 'underscore';
import Backbone from 'backbone';
import appstate from 'model/appstate';
import { localStorage } from 'service/storage';

'use strict';

class StateManager {

    constructor() {
        this.router = null;
    }

    start(router) {
        this.router = router;
        let historyStart = _.once(() => {
            Backbone.history.start();
        });       
        appstate.on("change", () => {
            historyStart();
            this._handleStateChange();
        });
        this.setInitialState();
    }

    setInitialState() {
        let requestInitialState = localStorage.get('RequestInitialHashState');
        if (requestInitialState && requestInitialState.data && requestInitialState.data.length > 0) {
            window.location.hash = requestInitialState.data;
            _.defer(function(){ appstate.fetch();}, 100);
            localStorage.invalidate('RequestInitialHashState');
        } else {
            appstate.fetch();
        }
    }

    get(key) {
        return appstate.get(key);
    }

    change(changedState, silent, runChange) {
        if (!_.isEmpty(changedState)) {
            appstate.set(changedState, {silent: silent});
            if (runChange) {
                this._handleStateChange();
            }
        }
    }

    _handleStateChange() {
        //// todo: handle state changes here
    }   
}

const stateManager = new StateManager();
export {
    stateManager as
    default
};
