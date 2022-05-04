/**
 * @author Harry Tang <harry@powerkernel.com>
 * @link https://powerkernel.com
 * @copyright Copyright (c) 2022 Power Kernel
 */

import { SubscriberClient } from "@powerkernel/common";
import { consumerOpts, createInbox, StringCodec } from "nats";
import { NatsClient } from ".";

class NatsSubscriberClient implements SubscriberClient {
  protected service: string;
  protected limit: number;

  constructor(service: string, limit = 1024) {
    this.service = service;
    this.limit = limit;
  }

  async subscribe(
    topic: string,
    cb: (msg: string) => Promise<void>
  ): Promise<void> {
    const js = NatsClient.client.jetstream();
    const opts = consumerOpts();
    opts.queue(this.service);
    opts.manualAck();
    opts.ackExplicit();
    opts.deliverTo(createInbox());
    opts.limit(this.limit);
    opts.callback(async (_, msg) => {
      if (msg !== null) {
        const sc = StringCodec();
        const eventDetail = sc.decode(msg.data);
        await cb(eventDetail);
        console.log("processed message: ", msg);
        await msg.ackAck();
        console.log("acked message:");
      }
    });
    await js.subscribe(topic, opts);
  }
}

export default NatsSubscriberClient;
