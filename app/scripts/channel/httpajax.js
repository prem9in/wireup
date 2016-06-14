import $ from 'jquery';
import _ from 'underscore';
import ajaxinstrumentation from 'channel/ajaxinstrumentation';
import contextProvider from 'service/contextprovider';
import cacheProvider from 'channel/cacheprovider';
import appConfig from 'model/appconfig';

'use strict';


let setContext = function(request, context, requestOptions) {
    let originalBeforeSend = request.beforeSend;
    request.beforeSend = function(jqXHR, settings) {
        // expect a map with key as string type
        if (requestOptions.headers) {
            let keys = Object.keys(requestOptions.headers);
            _.each(keys, function(key){
                jqXHR.setRequestHeader(key, requestOptions.headers[key]);
            });
        }

        if (_.isFunction(originalBeforeSend)) {
            originalBeforeSend(jqXHR, settings);
        }
    };
};

let prepareData = function(data, verb, contentType) {
    if (verb === 'GET') {
        return null;
    }

    if (typeof data !== 'string' && (contentType === 'application/json' || contentType === 'text/plain; charset=utf-8')) {
        return JSON.stringify(data);
    }

    return data;
};

let prepareUrl = function(url, data, verb, options) {
    if (url.indexOf('http') !== 0) {
        let root = appConfig.apiurl; /// set the root of api.
        if (root.charAt(root.length - 1) !== '/') {
            root += '/';
        }
        url = root + url;
    }

    if (verb === 'GET') {
        if (_.isObject(data) && _.isObject(data.query)) {
            url = url + (url.indexOf('?') === -1 ? '?' : '&') + $.param(data.query);
        }
        if (_.isObject(options) && _.isObject(options.query)) {
            url = url + (url.indexOf('?') === -1 ? '?' : '&') + $.param(options.query);
        }
    }

    if (_.isObject(options) && options.useProxy) {
        url = appConfig.proxyurl + '?' + $.param({host: encodeURI(url)});
    }

    return url;
};

let parseJson = function(jsonText) {
    try {
        return JSON.parse(jsonText);
    } catch (ex) {
        return jsonText;
    }
};

let handleAuthFailure = function (context) {
    //// todo: handle
};

class HttpAjax {

    ajax(verb, url, data, options) {
        let effectiveOptions = _.extend({}, options),
            deferred = $.Deferred(),
            promise,
            jqXhr;

        verb = verb.toUpperCase();
        let context = contextProvider.getContext(true);
        let ajaxOptions = {
            url: prepareUrl(url, data, verb, effectiveOptions),
            type: verb,
            data: prepareData(data, verb, effectiveOptions.contentType),
            contentType: effectiveOptions.contentType || 'application/json',
            dataType: effectiveOptions.dataType || 'json',
            cache: effectiveOptions.cache || false,
            beforeSend: effectiveOptions.beforeSend,
            skipCache:  _.isBoolean(effectiveOptions.skipCache) ? effectiveOptions.skipCache : false,
            xhrFields: {
                withCredentials: _.isBoolean(effectiveOptions.withCredentials) ? effectiveOptions.withCredentials : false,
            },
            bypassAjaxLogging: _.isBoolean(effectiveOptions.bypassAjaxLogging) ? effectiveOptions.bypassAjaxLogging : false,
            success: function(response, textStatus, xhr) {
                if (_.isFunction(effectiveOptions.success)) {
                    if (_.isObject(effectiveOptions.context)) {
                        effectiveOptions.success.call(effectiveOptions.context, response);
                    } else {
                        effectiveOptions.success(response);
                    }
                }
                deferred.resolve(response);
            },
            error: function(xhr, textStatus, errorThrown) {
                if (errorThrown && errorThrown.toLowerCase() == 'unauthorized') {
                    handleAuthFailure(context);
                    return;
                }
                let responseJson = xhr.responseText ? parseJson(xhr.responseText) : '';
                let err = {
                    error: errorThrown,
                    textStatus: textStatus,
                    xhr: xhr,
                    errorResponseBody: responseJson
                };
                if (_.isFunction(effectiveOptions.error)) {
                    if (_.isObject(effectiveOptions.context)) {
                        effectiveOptions.error.call(effectiveOptions.context, err);
                    } else {
                        effectiveOptions.error(err);
                    }
                }
                deferred.reject(err);
            }
        };

        setContext(ajaxOptions, context, effectiveOptions);
        ajaxinstrumentation.start(ajaxOptions, context);

        if (!ajaxOptions.skipCache) {
            cacheProvider.start(ajaxOptions);
        }

        if (!ajaxOptions.skipRequest) {
            jqXhr = $.ajax(ajaxOptions);
        }

        promise = deferred.promise();
        promise.cancel = function() {
            jqXhr && jqXhr.abort();
        };

        return promise;
    }
}


const httpajax = new HttpAjax();
export {
    httpajax as
    default
};
