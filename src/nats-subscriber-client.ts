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
  protected maxPullBatch: number;

  constructor(service: string, limit = 1024, maxPullBatch = 10) {
    this.service = service;
    this.limit = limit;
    this.maxPullBatch = maxPullBatch;
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
    opts.maxPullBatch(this.maxPullBatch);
    opts.callback(async (_, msg) => {
      if (msg !== null) {
        console.log("received message: ", msg.subject);
        const sc = StringCodec();
        const eventDetail = sc.decode(msg.data);
        await cb(eventDetail);
        console.log("processed message: ", msg.subject);
        await msg.ackAck();
        console.log("acked message: ", msg.subject);
      }
    });
    await js.subscribe(topic, opts);
  }
}

export default NatsSubscriberClient;
