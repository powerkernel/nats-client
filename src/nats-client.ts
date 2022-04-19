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

  private async addStreams(streams: string[]): Promise<void> {
    const jsm = await this.client.jetstreamManager();

    streams.forEach(async (stream) => {
      await jsm.streams.add({
        name: stream,
        subjects: [`${stream}.*`],
        retention: RetentionPolicy.Workqueue,
        storage: StorageType.Memory,
      });
    });

    console.log("Successfully configured JetStream");
  }

  async connect(options: ConnectionOptions, streams: string[]): Promise<void> {
    if (!this.wrappedClient) {
      try {
        this.wrappedClient = await connect(options);
        console.log(
          `Successfully connected to NATS server @ ${this.wrappedClient.getServer()}`
        );
        this.addStreams(streams);
      } catch (err) {
        console.error("Error connecting to NATS server");
      }
    }
  }

  async close(): Promise<void> {
    console.log("Closing NATS connection...");
    if (this.wrappedClient) {
      await this.wrappedClient.close();
    }
  }
}

export default new NatsClient();
