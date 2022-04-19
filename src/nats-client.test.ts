/**
 * @author Harry Tang <harry@powerkernel.com>
 * @link https://powerkernel.com
 * @copyright Copyright (c) 2022 Power Kernel
 */

import { NatsClient } from ".";

it("should throw error if NAST client is not connected", async () => {
  expect(() => {
    NatsClient.client;
  }).toThrow();
});
