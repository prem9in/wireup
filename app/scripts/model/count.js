import _ from 'underscore';
import Backbone from 'backbone';
import Base from 'model/base';


'use strict';

class Count extends Base {

    get idAttribute() {
        return 'id';
    }

    get url() {
        return 'url'; 
    }

    defaults() {
        return {
            "id": 1,
            "value": 0,
            "initialized": false,
        }
    }

    fetch() {
        // dummy code for filling up model
         _.delay(model => {
             let result = {value: Math.floor((Math.random() * 100) + 1), initialized: true };
             model.set(result)
        }, 100, this);
    }

    save() {
        throw 'Save is not supported on Section';
    }
}

const count = new Count();
export {
    count as
    default
};
