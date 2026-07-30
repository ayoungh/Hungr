import { defineConfig } from "orval";

export default defineConfig({
  hungr: {
    input: {
      target: "./api-docs.json",
    },
    output: {
      target: "./apps/web/src/api/index.ts",
      schemas: "./apps/web/src/api/model",
      client: "axios",
      mode: "single",
      clean: true,
      prettier: true,
    },
  },
});
