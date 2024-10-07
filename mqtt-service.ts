"use strict";
/**
 *
 */

import mqtt from "mqtt";
import path from "path";

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
    logger.info("connected ..", { filifu: __filename });

    interface topics_object {
      [key: string]: any;
    }

    let topics: topics_object = {};

    mqtt_status.serviceList.forEach((service: ttnService) => {
      let topic_head = service.get_topic();
      topics[path.join(mqtt_status.config.prefix, topic_head)] = { qos: 0 };

      topic_head = topic_head.substring(0, topic_head.indexOf("/"));
      mqtt_status.topicList[path.join(mqtt_status.config.prefix, topic_head)] =
        service;
    });

    logger.debug("topicList: [%o]", Object.keys(mqtt_status.topicList), {
      filifu: __filename,
    });

    mqtt_status.client.subscribe(topics, (err: Error, grant: any): void => {
      if (err) {
        logger.error("[%o]", err, { filifu: __filename });
      }

      if (grant) {
        logger.info("grant: [%o]", grant, { filifu: __filename });
      }
    });
  });

  mqtt_status.client.on(
    "message",
    (topic: string, message: Buffer, packet: mqtt.Packet): void => {
      // message is Buffer
      logger.debug(
        "message: topic: [%o], message: [%o] packet: [%o]",
        topic,
        JSON.parse(message.toString()),
        packet,
        { filifu: __filename },
      );

      let topic_head = topic.substring(0, topic.indexOf("/", 5));
      logger.debug("topic_head: [%o]", topic_head, { filifu: __filename });

      mqtt_status.topicList[topic_head].up_link(
        topic.replace(mqtt_status.config.prefix + "/", ""),
        message,
        packet,
      );
    },
  );

  mqtt_status.client.on("packetreceive", (packet: mqtt.Packet): void => {
    logger.debug("packetreceive: packet: [%o]", packet, { filifu: __filename });

    // TODO: implement callbacks for packet.cmd [pingresp, ..]
  });

  mqtt_status.client.on("close", (): void => {
    logger.debug("close ..", { filifu: __filename });
  });

  mqtt_status.client.on("offline", (): void => {
    logger.debug("offline ..", { filifu: __filename });
  });

  mqtt_status.client.on("disconnect", (): void => {
    logger.debug("disconnect ..", { filifu: __filename });
  });

  mqtt_status.client.on("end", (): void => {
    logger.debug("end ..", { filifu: __filename });
  });

  mqtt_status.client.on("error", (err: Error): void => {
    logger.error("[%o]", err, { filifu: __filename });
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
