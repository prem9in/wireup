import { sessionStorage, memoryStorage } from 'service/storage';
import Guid from 'service/guidgenerator';
import appstate from 'model/appstate';

'use strict';

let storage = sessionStorage.supportsStorage ? sessionStorage : memoryStorage;
let sessionIdKey = "_SessionKey";

class ContextProvider {
    constructor() {
        // when initialized, set the session
        let appsessionId = storage.get(sessionIdKey);
        if (!appsessionId) {
            appsessionId = Guid.getGuid();
            storage.set(sessionIdKey, appsessionId);
        }
        this.sessionId = appsessionId;        
    }

    getContext(requestIdNeeded) {
     
        let result = {
            sessionId: this.sessionId,
            url: window.location.href,          
            route: window.location.hash,  
            user: null //// this field can carry any access/authz token .. right now its null.       
        };

        if (requestIdNeeded) {
            result.requestId = Guid.getGuid();
        }

        return result;
    }
}

// initialize context provider only once
const contextProvider = new ContextProvider();
export {
    contextProvider as
    default
};
