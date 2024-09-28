"use strict";
/**
 *
 */

import mqtt from "mqtt";

import logger from "./utils/logger.js";

import { configType, ttnService } from "./lora-server-mqtt.js";

const __filename = new URL(import.meta.url).pathname.split("/").pop();

interface mqtt_status_object {
  [key: string]: any;
}

let mqtt_status: mqtt_status_object = {};

/**
 *
 */
const init = function init(config: configType, serviceList: Array<ttnService>) {
  //const init = function init(config: configType, serviceList: Array<Function>) {
  logger.info("starting ..", { filifu: __filename });

  mqtt_status["config"] = config.mqtt;
  mqtt_status["serviceList"] = serviceList;
  mqtt_status["topicList"] = [];

  logger.debug("config: [%o]", mqtt_status.config, { filifu: __filename });

  mqtt_status["client"] = mqtt.connect(mqtt_status.config.server, {
    username: mqtt_status.config.username,
    password: mqtt_status.config.password,
  });

  mqtt_status.client.on("connect", () => {
    logger.info("connected ..");

    interface topics_object {
      [key: string]: any;
    }

    let topics: topics_object = {};

    mqtt_status.serviceList.forEach((service: ttnService) => {
      mqtt_status.topicList[service.get_topic()] = service;
      topics[service.get_topic()] = { qos: 0 };
    });

    mqtt_status.client.subscribe(topics, (err: Error, grant: any): void => {
      if (err) {
        logger.error("[%o]", err);
      }

      if (grant) {
        logger.info("grant: [%o]", grant);
      }
    });
  });

  mqtt_status.client.on(
    "message",
    (topic: string, message: string, packet: mqtt.Packet): void => {
      // message is Buffer
      logger.debug(
        "topic: [%o], message: [%o] packet: [%o]",
        topic,
        message,
        packet,
      );

      //TODO: if topic is one of the listed call down_link-function of matching service
    },
  );

  mqtt_status.client.on("packetreceive", (packet: mqtt.Packet): void => {
    logger.debug("packet: [%o]", packet);
  });

  mqtt_status.client.on("close", (): void => {
    logger.debug("close ..");
  });

  mqtt_status.client.on("offline", (): void => {
    logger.debug("offline ..");
  });

  mqtt_status.client.on("disconnect", (): void => {
    logger.debug("disconnect ..");
  });

  mqtt_status.client.on("end", (): void => {
    logger.debug("end ..");
  });

  mqtt_status.client.on("error", (err: Error): void => {
    logger.error("[%o]", err);
  });
};

let shutdown = function shutdown() {
  logger.debug("shutdown ..", { filifu: __filename });

  let topics: Array<String> = [];

  mqtt_status.serviceList.forEach((service: ttnService) => {
    topics.push(service.get_topic());
  });

  mqtt_status.client.unsubscribe(topics, (err: any): void => {
    if (err) {
      logger.error("error on unsubscribe [%o]", err, { filifu: __filename });
    }
  });

  mqtt_status.client.end();
};

export default {
  init: init,
  shutdown: shutdown,
};
