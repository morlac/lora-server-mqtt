"use strict";

/**
 *
 */

import logger from "./utils/logger.js";

import { configType } from "./lora-server-mqtt.js";
import { Packet as mqtt_packet } from "mqtt";

const __filename = new URL(import.meta.url).pathname.split("/").pop();

interface status_object {
  [key: string]: any;
}

let status: status_object = {};

/**
 *
 */
const init = function init(config: configType) {
  logger.info("starting with topic: [%o]", config.services.ttnplanet.topic, {
    filifu: __filename,
  });

  status["topic"] = config.services.ttnplanet.topic;
};

/**
 *
 */
const get_topic = function get_topic(): string {
  return status.topic;
};

/**
 *
 */
const down_link = function down_link(message: Buffer, packet: mqtt_packet) {
  logger.debug("message: [%o], packet: [%o]", message, packet, { filifu: __filename });
};

/**
 *
 */
const up_link = function up_link(topic: string, message: Buffer, packet: mqtt_packet) {
  logger.debug("topic: [%o], message: [%o], packet: [%o]", topic, message, packet, { filifu: __filename });
};

/**
 *
 */
const shutdown = function shutdown() {
  logger.info("shutdown ..", { filifu: __filename });
};

export default {
  init: init,
  get_topic: get_topic,
  down_link: down_link,
  up_link: up_link,
  shutdown: shutdown,
};
