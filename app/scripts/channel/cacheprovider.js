import $ from 'jquery';
import _ from 'underscore';
import { sessionStorage, memoryStorage } from 'service/storage';
import appConfig from 'model/appconfig';

'use strict';

let excludedParams = ['_', 'session-id', 'request-id', 'X-Requested-With', 'Prefer', 'api-version', 'searchMode', 'api-key'];
let datatimestampParamName = 'clientCacheDataTimestamp';

let storage = sessionStorage.supportsStorage ? sessionStorage : memoryStorage;

let removeParamsFromJson = function(paramJson) {
    if (paramJson) {
        let keysToDelete = [];
        for (let key in paramJson) {
            if (paramJson.hasOwnProperty(key)) {
                _.each(excludedParams, function(item) {
                    if (key.toLowerCase().indexOf(item.toLowerCase()) > -1) {
                        keysToDelete.push(key);
                    }
                });
            }
        }
        _.each(keysToDelete, function(item) {
            delete paramJson[item];
        });
    }
};

let getCacheKey = function(url, params) {
    let resultKey = url + "_";  
    //// todo: replace the base url with empty string 
    resultKey = resultKey.replace(appConfig.apiurl, '');
    if (params) {
        if (typeof params == 'string') {
            try {
                let paramJson = $.parseJSON(params);
                removeParamsFromJson(paramJson);
                resultKey += JSON.stringify(paramJson);
            } catch (e) {
                if (params.indexOf("&") != -1) {
                    let paramsAsString = "";
                    let paramArray = params.split("&");
                    _.each(paramArray, function(arg) {
                        if (arg) {
                            let exclude = false;
                            _.each(excludedParams, function(exitem) {
                                if (arg.toLowerCase().indexOf(exitem.toLowerCase()) > -1) {
                                    exclude = true;
                                    return false;
                                }
                            });
                            if (!exclude) {
                                paramsAsString += "&" + arg;
                            }
                        }
                    });
                    resultKey += paramsAsString;
                } else {
                    //// prepending MemCache_ to key for determining usage of memory cache in this case
                    resultKey = "MemCache_" + resultKey + params;
                }
            }
        } else {
            let paramsCopy = _.extend({}, params);
            removeParamsFromJson(paramsCopy);
            resultKey += JSON.stringify(paramsCopy);
        }
    }

    return resultKey;
};

class CacheProvider {
    start(requestOptions) {
        let cacheKey = getCacheKey(requestOptions.url, requestOptions.data);
        let cachedData = storage.get(cacheKey);
        let requestData = _.extend({}, requestOptions.data);
        if (cachedData &&
            cachedData.hasOwnProperty(datatimestampParamName)
            // todo add any global cache expiration policy
            // or add any model specific cache expiration policy
            ) {
            requestOptions.skipRequest = true;
            if (_.isFunction(requestOptions.success)) {
                _.defer(function(){
                    requestOptions.success(cachedData);
                });
            }
        } else {
            requestOptions.data = requestData;
            let originalSuccess = requestOptions.success;
            requestOptions.skipRequest = false;
            requestOptions.success = function(data, textStatus, xhr) {
                // todo determine any failures before updating cache
                let responseData = data;
                if (responseData) {
                    if (responseData.noupdates == true) {
                        responseData = cachedData;
                    } else {
                        responseData[datatimestampParamName] = (new Date()).getTime();
                        storage.set(cacheKey, responseData);
                    }
                }
                if (_.isFunction(originalSuccess)) {
                    originalSuccess(responseData, textStatus, xhr);
                }
            }
        }
    }
}

const cacheProvider = new CacheProvider();
export {
    cacheProvider as
    default
};
