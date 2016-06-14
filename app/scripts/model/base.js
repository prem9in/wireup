import Backbone from 'backbone';
import httpajax from 'channel/httpajax';
import _ from 'underscore';
import {
    sessionStorage
}
from 'service/storage';

'use strict';

export default class Base extends Backbone.Model {

    constructor(attributes, options) {
        super(attributes, options);
        this.fetchtimestamp = 0;
    }
    
    fetch(options) {
        this.fetchtimestamp = (new Date()).getTime();
        options = _.extend({
            parse: true,
            method: 'read',
            fstamp: this.fetchtimestamp
        }, options);
        let model = this;
        let success = options.success;
        options.success = function(resp) {
            // this ensures last result is the one updating the model
            if (model.fetchtimestamp == options.fstamp) {
                var serverAttrs = options.parse ? model.parse(resp, options) : resp;
                if (!options.skipModelUpdate && !model.set(serverAttrs, options)) {
                    return false;
                }
                if (_.isFunction(success)) {
                    if (_.isObject(options.context)) {
                        success.call(options.context, model, resp, options);
                    } else {
                        success(model, resp, options);
                    }
                }
                model.trigger('sync', model, resp, options);
            }
        };

        return this.sync(options.method, this, options);
    }

    sync(method, model, options) {
        let url = options.url || this.url;
        let data = options.model ? options.model : model.toJSON();
        let idatttribute = options.idatttribute ? options.idatttribute : model.idAttribute;
        if (idatttribute && data[idatttribute] && options.substituteId) {
            url = this.url + '(' + data[idatttribute] + ')';
        }
        let verb = 'GET';
        switch (method) {
            case 'read':
                verb = 'GET';
                break;
            case 'execute':
                verb = 'POST';
                break;
            case 'create':
                if (idatttribute) {
                    delete data[idatttribute];
                }
                verb = 'POST';
                break;
            case 'update':
                verb = 'PATCH';
                break;
            case 'delete':
                verb = 'DELETE';
                break;
        }

        return httpajax.ajax(verb, url, data, options);
    }

    parse(response, options) {
        let result = response;
        if (response) {
            // check for array first
            if (_.isArray(response)) {
                result = response;
                // check for object second
            } else if (_.isObject(response)) {
                result = _.extend({
                    initialized: true
                }, response);
            } else {
                result = response;
            }
        } else {
            result = _.extend(this.defaults(), {
                initialized: true
            });
        }
        return result;
    }    
}
