/**
 * @author Harry Tang <harry@powerkernel.com>
 * @link https://powerkernel.com
 * @copyright Copyright (c) 2022 Power Kernel
 */

import { SubscriberClient } from "@powerkernel/common";
import { consumerOpts, StringCodec } from "nats";
import { NatsClient } from ".";

class NatsSubscriberClient implements SubscriberClient {
  protected service: string;
  protected maxAckPending: number;
  protected durableName: string;

  constructor(service: string, maxAckPending = 10, durableName: string) {
    this.service = service;
    this.maxAckPending = maxAckPending;
    this.durableName = durableName;
  }

  async subscribe(
    topic: string,
    cb: (msg: string) => Promise<void>
  ): Promise<void> {
    const js = NatsClient.client.jetstream();
    const opts = consumerOpts();
    opts.durable(this.durableName);

    // queue & deliverTo must be the same
    opts.deliverTo(this.service);
    opts.queue(this.service);

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
