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
  protected maxAckPending: number;

  constructor(service: string, maxAckPending = 10) {
    this.service = service;
    this.maxAckPending = maxAckPending;
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
    opts.maxAckPending(this.maxAckPending);
    opts.callback(async (_, msg) => {
      if (msg !== null) {
        console.log("received message: ", msg.seq);
        const sc = StringCodec();
        const eventDetail = sc.decode(msg.data);
        await cb(eventDetail);
        console.log("processed message: ", msg.seq);
        await msg.ackAck();
        console.log("acked message: ", msg.seq);
      }
    });
    await js.subscribe(topic, opts);
  }
}

export default NatsSubscriberClient;
