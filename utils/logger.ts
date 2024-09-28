"use strict";

/**
 * logger module
 *
 * requires: 'magic-globals-mod.js
 *
 * setup: edit variable 'appName'
 *
 * usage:
 * include 'var logger = require('path/to/logger');'
 *
 * logger.debug('plain text');
 * => 2019-04-22 09:08:19 [my App] [debug]: plain text
 *
 * logger.info(`test object without user and filifu %o`, {test: 'test', number: 123});
 * => 2019-04-22 09:08:19 [my App] [info]: test object without user and filifu { test: 'test', number: 123 }
 *
 * logger.warn(`a log with user and filifu`, {user: 'testuser', filifu: __filifu});
 * => 2019-04-22 09:08:19 [my App] [warn] [testuser] [index.js (12): myFunction]: a log with user and filifu
 *
 * logger.warn(`test object with user and filifu %o`, {test: 'test 2', number: 456}, {user: 'testuser', filifu: __filifu});
 * => 2019-04-22 09:08:19 [my App] [warn] [testuser] [index.js (13): myFunction]: test object with user and filifu { test: 'test 2', number: 456 }
 *
 * log levels (default ones):
 *   {
 *     error: 0,
 *     warn: 1,
 *     info: 2,
 *     http: 3,
 *     verbose: 4,
 *     debug: 5,
 *     silly: 6
 *   }
 */

const appName = "Lora MQTT Server";

import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize, splat, prettyPrint, label } =
  format;
import "winston-daily-rotate-file";

import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/../config.json"), "utf8"),
);
*/

import config from "../config.json" with { type: "json" };
//import config from "../config.json" assert { type: "json" };

const logLevel =
  process.env.NODE_ENV === "production"
    ? config.logLevel.production
    : config.logLevel.test;

const logFormat = printf(
  ({ timestamp, label, level, user, filifu, message }) => {
    let u = user === undefined ? "" : " [" + user + "]";
    let f = filifu === undefined ? "" : " [" + filifu + "]";

    return `${timestamp} [${label}] [${level}]${u}${f}: ${message}`;

    //return `${timestamp} [${label}] [${level}] [${user}] [${filifu}]: ${message}`;
  },
);

const logDir = path.join(__dirname, "../logs/");

const options = {
  file: {
    level: logLevel,
    filename: `${logDir}/%DATE%.log`,
    datePattern: "YYYYMMDD",
    format: combine(
      splat(),
      label({ label: appName }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      logFormat,
    ),
    //prepend: true,
    zippedArchive: true,
    json: true,
    handleExceptions: true,
  },
  console: {
    level: logLevel,
    format: combine(
      splat(),
      label({ label: appName }),
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      logFormat,
    ),
    handleExceptions: true,
  },
};

const logger = createLogger({
  transports: [
    new transports.Console(options.console),
    new transports.DailyRotateFile(options.file),
  ],
  exitOnError: false,
});

/*
logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
}
*/

/*
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.label({ label: 'MY-SILLY-APP' }),
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label' ] }),
        winston.format.colorize(),
        winston.format.printf((level, message, timestamp, label, user, filifu) => {
      let out = `${timestamp} [${label}] [${level}] [${user}] [${filifu}]: ${message}`;
            //let out = `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
          	
            return out;
        }),
    ),
    transports: [
        new winston.transports.Console()
    ]
});
*/

export default logger;
