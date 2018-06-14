const { createLogger, format, transports } = require('winston');
const util = require('util');
const uuid = require('uuid/v1');

const fmt = format.printf((info) => {
    return `${info.timestamp} [${info.level}] ${info.message}`;
});

const logger = createLogger({
    format: format.combine(
        format.splat(),
        format.simple(),
        format.timestamp(),
        fmt
    ),
    transports: [
        new (transports.Console)({
            level: 'debug',
            handleExceptions: true,
        })
    ]

});

/**
* Takes object and returns string representation of object/array or other type that should be safe to log even if object/array is very large.
*
* @param {Request} req Express Request.
* @returns {string} reqString
*/
function largeObjToSafeString(obj) {
    return util.inspect(obj, {maxArrayLength: 5});
};

logger.largeObjToSafeString = largeObjToSafeString;

/**
* Takes Express Request object and returns short string representation of request.
*
* @param {Request} req Express Request.
* @returns {string} reqString
*/
logger.reqToString = function(req) {
    return util.format('%s url: %s body=%s', req.method, req.baseUrl , JSON.stringify(req.body));
};

/**
* Logs Express Response.
*
* @param {Request} req Express Request.
* @param {number} status Response HTTP status.
* @param {Object} response Response object/array or other type
*/
logger.logResponse = function(req, status, response) {
    return util.format('Responding to request %s with %d: %s', this.reqToString(req), status, largeObjToSafeString(response));
};

/**
* Monitoring and profiling helper class.
* Instantiate this at the beginning of function to log and profile.
* Then use debug, info or log to log progress.
* Then call error or done when monitoring finished to log duration.
*
* @class
*/
logger.monitor = class monitor {

    /**
    * Initialize monitor class and store when monitoring started to get duration later.
    *
    * @constructor
    * @param {string} moduleName Name of module to be shown in logs during this monitoring session
    * @param {string} functionName Name of function in module to be shown in logs for this monitoring session
    */
    constructor(moduleName, functionName) {
        this.moduleName = moduleName;
        this.functionName = functionName;
        this.start = Date.now();
        this.monitorHash = uuid(); // unique hash for tracking monitor accross function
        logger.info(util.format('[%s] (-%s-) START %s', this.moduleName, this.monitorHash, this.functionName));
    }

    /**
    * log debug level message
    *
    * @param {string...} msgArgs Can be string message or can be same input as util.format
    */
    debug() {
        const msg = util.format(...arguments); // do util format on arguments
        logger.debug(util.format('[%s] (-%s-) %s : %s'), this.moduleName, this.monitorHash, this.functionName, msg);
    }

    /**
    * log info level message
    *
    * @param {string...} msgArgs Can be string message or can be same input as util.format
    */
    info() {
        const msg = util.format(...arguments); // do util format on arguments
        logger.info(util.format('[%s] (-%s-) %s : %s'), this.moduleName, this.monitorHash, this.functionName, msg);
    }

    /**
    * log warn level message
    *
    * @param {string...} msgArgs Can be string message or can be same input as util.format
    */
    warn() {
        const msg = util.format(...arguments); // do util format on arguments
        logger.warn(util.format('[%s] (-%s-) %s : %s'), this.moduleName, this.monitorHash, this.functionName, msg);
    }

    /**
    * log error level message and print duration since monitoring start
    *
    * @param {string...} msgArgs Can be string message or can be same input as util.format
    */
    error() {
        const msg = util.format(...arguments); // do util format on arguments
        const duration = (Date.now()) - this.start;
        logger.error(util.format('[%s] (-%s-) ERROR END %s took %d ms : %s'), this.moduleName, this.monitorHash, this.functionName, duration, JSON.stringify(msg));
    }

    /**
    * log info level message and print duration since monitoring start
    *
    * @param {string...} msgArgs Can be string message or can be same input as util.format
    */
    done() {
        const msg = util.format(...arguments); // do util format on arguments
        const duration = (Date.now()) - this.start;
        logger.info(util.format('[%s] (-%s-) END %s took %d ms : %s', this.moduleName, this.monitorHash, this.functionName, duration, largeObjToSafeString(msg)));
    }

};

module.exports = logger;