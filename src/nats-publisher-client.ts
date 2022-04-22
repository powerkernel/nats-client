/**
 * @author Harry Tang <harry@powerkernel.com>
 * @link https://powerkernel.com
 * @copyright Copyright (c) 2022 Power Kernel
 */

import { PublisherClient } from "@powerkernel/common";
import { StringCodec } from "nats";
import { NatsClient } from ".";

class NatsPublisherClient implements PublisherClient {
  async publish(topic: string, data: string): Promise<void> {
    const client = NatsClient.client;
    const js = client.jetstream();
    const sc = StringCodec();
    js.publish(topic, sc.encode(data));
  }
}

export default NatsPublisherClient;
