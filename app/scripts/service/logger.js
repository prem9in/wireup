import $ from 'jquery';
import _ from 'underscore';
import contextProvider from 'service/contextprovider';

'use strict';

const logUrl = ""; // set the url where logs will be posted.

const flushInterval = 10000;
const maxBufferSize = 50;
let logBuffer = [];
let metricBuffer = [];
let flushing = false;

let flushLog = function(force) {
     if (logUrl) {
        if (force ||
            (  ((logBuffer && logBuffer.length > 0) || (metricBuffer && metricBuffer.length > 0))
                && !flushing)
            ) {
            flushing = true;
            let data = {
                Events: _.clone(logBuffer),
                Metrics: _.clone(metricBuffer)
            };
            $.ajax({
                type: "POST",
                url: logUrl,
                data: JSON.stringify(data),
                contentType: 'application/json',
                beforeSend: function(jqXHR, settings) {
                    let context = contextProvider.getContext(true);
                    jqXHR.setRequestHeader('session-id', context.sessionId);
                    jqXHR.setRequestHeader('request-id', context.requestId);
                    if (context.user) {
                        jqXHR.setRequestHeader('Authorization', 'Bearer ' + context.user.AccessToken);
                    }
                    jqXHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                }
            }).done(function() {
                flushing = false;
                logBuffer = _.rest(logBuffer, data.Events.length);
                metricBuffer = _.rest(metricBuffer, data.Metrics.length);
            })
            .fail(function() {
                flushing = false;
            });
        }
    }
};

let flushTimer = window.setInterval(flushLog, flushInterval);

let getUTCTimeISOString = function(datetime) {
    let utcDate = new Date(
        datetime.getUTCFullYear(),
        datetime.getUTCMonth(),
        datetime.getUTCDate(),
        datetime.getUTCHours(),
        datetime.getUTCMinutes(),
        datetime.getUTCSeconds(),
        datetime.getUTCMilliseconds());
    return utcDate.toISOString();
}

class Logger {

    constructor() {
        let that = this;
        window.onerror = function(msg, fileName, line, col, error) {
                var message = "msg: " + msg + " fileName: " + fileName + " line: " + line;
                if (error) {
                    message += " stack: " + error.stack;
                }
                that.log(message, "ClientError", "Error");
                console.log(message);
            }
            /// flush buffer upon window unload/referesh
        $(window).on("unload", function() {
            flushLog(true);
            window.clearInterval(flushTimer);
        });
    }

    traceInfo(message) {
        this.log(message, "ClientTrace", "Verbose");
    }

    logError(message) {
        this.log(message, "ClientError", "Error");
    }
   

    log(message, category, level, methodName, startTime, endTime, status, requestId) {
        let appContext = contextProvider.getContext();
        let aiCommonEvent = {
            Message: message,
            EventType: category,
            LogLevel: level,
            OperationName: methodName,
            StartTime: startTime ? getUTCTimeISOString(startTime) : '',
            EndTime: endTime ? getUTCTimeISOString(endTime) : '',
            DurationMs: (endTime && startTime) ? (endTime - startTime) : 0,
            Status: status,
            SessionId: appContext.sessionId,
            //// any other fields to be later added 
        };

        if (requestId) {
            aiCommonEvent.RequestId = requestId;
        }

        logBuffer.push(aiCommonEvent);
        if (logBuffer.length > maxBufferSize) {
            flushLog();
        }
    }

    metric(methodName, status, duration) {
        metricBuffer.push({
            MethodName: methodName,
            Status: status,
            DurationMs: duration
        });
        if (metricBuffer.length > maxBufferSize) {
            flushLog();
        }
    }
}

const logger = new Logger();
export {
    logger as
    default
};
