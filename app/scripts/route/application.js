import Backbone from 'backbone';
import AppRouter from 'route/approuter';
import stateManager from 'route/statemanager';
import arrayExtension from 'service/arrayextension';
import stringExtension from 'service/stringextension';
import dependencies from 'model/dependencies';

'use strict';

class Application {

    constructor() {
        this.router = new AppRouter();
    }

    start() {
        stateManager.start(this.router);
    }
}

const application = new Application();
export {
    application as
    default
};
