import { describe, expect, it } from "vitest";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { RawTypeSafeClient } from "../lib/client/raw-fetch-client.js";
import { SYSTEMONE_PATH } from "../lib/constants.js";
import { createFixtureFetch, loadFixture } from "../testing/fixtures.js";

describe("SDK / raw HTTP twin parity", () => {
  it("returns identical answers for the same fixture payload", async () => {
    const fixture = loadFixture("systemone/noul-simple.json");
    const routes = [
      {
        method: "POST" as const,
        path: SYSTEMONE_PATH,
        body: fixture,
      },
    ];
    const fetchImpl = createFixtureFetch(routes) as typeof fetch;

    const sdk = createTypeSafeClient({ fetch: fetchImpl });
    const raw = new RawTypeSafeClient({ apiKey: "sk-test", fetchImpl });

    const request = {
      state: "Refund please",
      questions: { wantsRefund: { type: "noul" as const, instructions: "Refund?" } },
    };

    const [sdkResult, rawResult] = await Promise.all([
      sdk.systemOne(request),
      raw.systemOne(request),
    ]);

    expect(rawResult).toEqual(sdkResult);
    expect(sdkResult.answers.wantsRefund).toEqual(rawResult.answers.wantsRefund);
    expect(sdkResult.usage).toEqual(rawResult.usage);
    expect(sdkResult.model).toEqual(rawResult.model);
  });
});
