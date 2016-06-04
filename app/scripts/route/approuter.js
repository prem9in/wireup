import Backbone from 'backbone';
import Index from 'view/index';
import stateManager from 'route/statemanager';
import appRouteMap from 'route/routemaps';

'use strict';

export default class AppRouter extends Backbone.Router {
    constructor() {  
        /// any runtime changes to route can be done here.    
        super(appRouteMap);
    }

   
    render() {
       
        // set default state and change as needed via args to this method.
        let state = {
            
        };
       
        stateManager.change(state);

        new Index({ el: document.body }).render();
    }   
}
