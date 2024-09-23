/**
 *
 */

import "./utils/magic-globals-mod.js";

import logger from "./utils/logger.js";

import fs from "fs";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import mqtt from "mqtt";

process.on("uncaughtException", function pr_on_ex(err) {
  logger.error("uncaught exeption", { message: err.message, stack: err.stack });

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

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

let config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./config.json"), "utf8"),
);

let client = mqtt.connect(config.mqtt_server, {
  username: config.mqtt_username,
  password: config.mqtt_password,
});

logger.info("starting ..");

client.on("connect", () => {
  logger.info("connected ..");
  // morlac-ttnmapper@ttn

  let topics = {};
  topics[config.topics.ttnmapper] = { qos: 0 };
  topics[config.topics.ttnplanet] = { qos: 0 };

  client.subscribe(topics, (err, grant) => {
    if (err) {
      logger.error("[%o]", err);
    }

    if (grant) {
      logger.info("grant: [%o]", grant);
    }
  });
});

client.on("message", (topic, message) => {
  // message is Buffer
  logger.debug("topic: [%o], message: [%o]", topic, message);
});

client.on("packetreceive", (packet) => {
  logger.debug("packet: [%o]", packet);
});

client.on("close", () => {
  logger.debug("close ..");
});

client.on("offline", () => {
  logger.debug("offline ..");
});

client.on("disconnect", () => {
  logger.debug("disconnect ..");
});

client.on("end", () => {
  logger.debug("end ..");
});

client.on("error", (err) => {
  logger.error("[%o]", err);
});

let shutdown = function shutdown() {
  logger.debug("shutdown called ..");

  client.unsubscribe(
    ["morlac-ttnmapper@ttn/#", "morlac-ttnloraplanet@ttn/#"],
    (err) => {
      if (err) {
        logger.error("error on unsubscribe [%o]", err);
      }
    },
  );

  client.end();

  sleep(2500);
};
