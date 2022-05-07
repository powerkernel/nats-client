/**
 * @author Harry Tang <harry@powerkernel.com>
 * @link https://powerkernel.com
 * @copyright Copyright (c) 2022 Power Kernel
 */

import {
  connect,
  ConnectionOptions,
  NatsConnection,
  RetentionPolicy,
  StorageType,
} from "nats";

class NatsClient {
  private wrappedClient?: NatsConnection;

  get client(): NatsConnection {
    if (!this.wrappedClient) {
      throw new Error("Cannot access NATS client before connecting");
    }
    return this.wrappedClient;
  }

  async addStreams(streams: string[]): Promise<void> {
    const jsm = await this.client.jetstreamManager();

    streams.forEach(async (stream) => {
      await jsm.streams.add({
        name: stream,
        subjects: [`${stream}.*`],
        retention: RetentionPolicy.Interest,
        storage: StorageType.Memory,
      });
    });

    console.info("Successfully configured JetStream");
  }

  async connect(options: ConnectionOptions): Promise<void> {
    if (!this.wrappedClient) {
      this.wrappedClient = await connect(options);
      console.info(
        `Successfully connected to NATS server @ ${this.wrappedClient.getServer()}`
      );
    }
  }

  async close(): Promise<void> {
    console.info("Closing NATS connection...");
    if (this.wrappedClient) {
      await this.wrappedClient.close();
    }
  }
}

export default new NatsClient();
