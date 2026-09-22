import { describe, expect, it } from "vitest";
import { JEV_LATEST, JEV_PINNED } from "../lib/constants.js";
import { createTypeSafeClient } from "../lib/client/typesafe-client.js";
import { demoLatestModel, demoListModels, demoPinnedModel } from "../demos/models-demo.js";
import { createFixtureFetch, modelsRoute, systemOneRoute } from "../testing/fixtures.js";

describe("Models", () => {
  it("resolves jev-latest alias to versioned model in response", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([systemOneRoute("systemone/model-latest.json")]),
    });
    const response = await demoLatestModel(client, "Billing question");
    expect(response.model).toBe(JEV_PINNED);
  });

  it("uses pinned jev-1.13.0 model id", async () => {
    const client = createTypeSafeClient({
      defaultModel: JEV_PINNED,
      fetch: createFixtureFetch([systemOneRoute("systemone/model-pinned.json")]),
    });
    const response = await demoPinnedModel(client, "Billing question");
    expect(response.model).toBe(JEV_PINNED);
  });

  it("lists models via GET /v1/models", async () => {
    const client = createTypeSafeClient({
      fetch: createFixtureFetch([modelsRoute()]),
    });
    const models = await demoListModels(client);
    expect(models.some((m: { name: string }) => m.name === JEV_LATEST)).toBe(true);
  });
});
