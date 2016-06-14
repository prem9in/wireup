import Backbone from 'backbone';
import httpajax from 'channel/httpajax';
import _ from 'underscore';

'use strict';

export default class Base extends Backbone.Collection {

    constructor(models, options) {
        super(models, options);
        this.fetchtimestamp = 0;
    }

    fetch(options) {
        this.fetchtimestamp = (new Date()).getTime();
        options = _.extend({
            parse: true,
            method: 'read',
            fstamp: this.fetchtimestamp
        }, options);
        let success = options.success;
        let collection = this;
        options.success = function(resp) {
            // this ensures last result is the one updating the collection
            if (collection.fetchtimestamp == options.fstamp) {
                var serverAttrs = options.parse ? collection.parse(resp, options) : resp;
                var method = options.reset ? 'reset' : 'set';
                collection[method](serverAttrs, options);
                if (_.isFunction(success)) {
                    if (_.isObject(options.context)) {
                        success.call(options.context, collection, resp, options);
                    } else {
                        success(collection, resp, options);
                    }
                }
                collection.trigger('sync', collection, resp, options);
            }
        };
        return this.sync(options.method, this, options);
    }

    //// Only GET should be called for collections
    sync(method, collection, options) {
        let url = options.url || this.url;
        let data = options && options.model ? options.model : collection.toJSON();
        let verb = 'GET';
        switch (method) {
            case 'read':
                verb = 'GET';
                break;
            case 'execute':
                verb = 'POST';
                break;
            case 'create':
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
}
