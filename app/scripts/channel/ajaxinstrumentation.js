import _ from 'underscore';
import logger from 'service/logger';
'use strict';

let log = true; 
let startPerf = function(request, context) {
    let time = new Date();
    let originalSuccess = request.success;
    request.success = function(data, textStatus, xhr) {
        stopPerf(time, request.url, false, context, xhr, false);
        if (_.isFunction(originalSuccess)) {
            var afterSuccessTime = new Date();
            originalSuccess(data, textStatus, xhr);
            stopPerf(afterSuccessTime, request.url, true, context, xhr, false);
        }
    };
    let originalError = request.error;
    request.error = function(xhr, textStatus, errorThrown) {
        stopPerf(time, request.url, false, context, xhr, true, errorThrown, xhr ? xhr.responseText : '');
        if (_.isFunction(originalError)) {
            var afterErrorTime = new Date();
            originalError(xhr, textStatus, errorThrown);
            stopPerf(afterErrorTime, request.url, true, context, xhr, true, errorThrown, xhr ? xhr.responseText : '');
        }
    };
};

let stopPerf = function(startTime, url, isAfterResponseProcessing, context, xhr, isError, errorThrown, errorMessage) {
    let endTime = new Date();
    let timespent = endTime.getTime() - startTime.getTime();   
    if (log) {
        let message = "";
        if (isAfterResponseProcessing) {
            message = "Script execution time after response from " + url + ", in milli-seconds : " + timespent;
        } else {
            message = "Response time from API for url " + url + " in milli-seconds : " + timespent;
        }
        
        let parts = _.filter(url.split('/'), function(p){ return p; });
        var methodName = "";
        if (parts.length > 1) {
            methodName = parts[0] + "_" + parts[1];
        } else {
            methodName = parts[0];
        }
        if (isAfterResponseProcessing) {
           methodName = "Script_After_" + methodName;
        }
        let status = isError ? "Failure" : "Success";
        let category = isError ? "ClientError" : "ClientTrace";
        let level = isError? "Error" : "Info";
        let requestId = context.requestId;
        if (xhr) {
            // this means response is not from client cache
            requestId = xhr.getResponseHeader('request-id');
            // request Id is not guranteed to be present before request.done is called ... so falling back to read from context.
            requestId = requestId || context.requestId;
        } else {
            methodName = "Cache_" + methodName;
            message = "Response time from cache for " + url + ", in milli-seconds : " + timespent;
        }

        if (isError) {
            if (!isAfterResponseProcessing) {
                message = 'Call to ' + url + ' failed. TimeSpent: ' + timespent + '. ERROR: ' + errorThrown + ' ' + errorMessage;
                message = message ? message : 'Call to ' + url + ' failed. TimeSpent: ' + timespent + '.';
                logger.log(message, category, level, methodName, startTime, endTime, status, requestId);
            }
        } else {
            // general trace log
            logger.log(message, category, level, methodName, startTime, endTime, status, requestId);
            // hot bed metric log
            if (methodName &&
                !methodName.startsWith('indexes_') && // skip search calls for metric
                !methodName.startsWith('Script_After_') && // skip after processing for metric
                !methodName.startsWith('Cache_')) // skip cache call for metric
            {
                logger.metric(methodName, status, timespent);
            }
        }
    }
};


class AjaxInstrumentation {
    start(ajaxOptions, context) {
        if (!ajaxOptions.bypassAjaxLogging) {
            startPerf(ajaxOptions, context);
        }
    }
}

const ajaxinstrumentation = new AjaxInstrumentation();
export {
    ajaxinstrumentation as
    default
};
