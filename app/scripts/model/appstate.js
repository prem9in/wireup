import Backbone from 'backbone';

'use strict';

class AppState extends Backbone.Model {

    defaults() {
        return {
            //// define application states here.
            initialized: false
        }
    }

    fetch() {
          _.delay(model => {
            model.set({initialized: true});
        }, 100, this);
    }

    sync(method, model, options) {
        throw 'Sync not supported for AppState';
    }
}

const appstate = new AppState();
export {
    appstate as
    default
};
