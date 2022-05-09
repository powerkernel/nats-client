/**
 * @author Harry Tang <harry@powerkernel.com>
 * @link https://powerkernel.com
 * @copyright Copyright (c) 2022 Power Kernel
 */

import { Helper, SubscriberClient } from "@powerkernel/common";
import { consumerOpts, StringCodec, createInbox } from "nats";
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
    opts.durable(Helper.md5(topic));
    opts.deliverTo(createInbox(topic));
    opts.manualAck();
    opts.ackExplicit();
    opts.maxAckPending(this.maxAckPending);
    opts.callback(async (_, msg) => {
      if (msg !== null) {
        const sc = StringCodec();
        const eventDetail = sc.decode(msg.data);
        await cb(eventDetail);
        await msg.ackAck();
      }
    });
    await js.subscribe(topic, opts);
  }
}

export default NatsSubscriberClient;
