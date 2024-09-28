"use strict";
/**
 *
 */

//import "./utils/magic-globals-mod.js";
import logger from "./utils/logger.js";

import path from "path";
import url from "url";
import mqtt from "mqtt";

export type ttnService = {
  init: (config: configType) => void;
  get_topic: () => string;
  down_link: (message: string, packet: mqtt.Packet) => void;
  up_link: () => void;
  shutdown: () => void;
};

import ttnenvironmentService from "./ttnenvironment-service.js";
import ttnmapperService from "./ttnmapper-service.js";
import ttnplanetService from "./ttnplanet-service.js";

import mqttService from "./mqtt-service.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf8"),
);
*/

import config from "./config.json" with { type: "json" };
export type configType = typeof config;

const serviceList: Array<ttnService> = [
  ttnenvironmentService,
  ttnmapperService,
  ttnplanetService,
];

process.on("uncaughtException", function pr_on_ex(err: Error) {
  logger.error("uncaught exeption", {
    message: err.message,
    stack: err.stack,
  });

  shutdown();

  process.exit(-1);
});

process.on("SIGTERM", function pr_on_sigterm() {
  logger.info("received SIGTERM");
  shutdown();
  process.exit(0);
});

process.on("SIGINT", function pr_on_sigint() {
  logger.info("received SIGINT");
  shutdown();
  process.exit(0);
});

const sleep = (waitTimeInMs: number) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

/**
 *
 */
const init = function init(config: configType) {
  logger.info("starting ..");

  serviceList.forEach((service) => service.init(config));

  mqttService.init(config, serviceList);
};

/**
 *
 */
const shutdown = function shutdown() {
  logger.debug("shutdown called ..");

  mqttService.shutdown();

  serviceList.reverse().forEach((service) => service.shutdown());

  sleep(2500);
};

init(config);
