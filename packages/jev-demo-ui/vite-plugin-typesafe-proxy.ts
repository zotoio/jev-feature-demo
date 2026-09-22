import type { Plugin } from "vite";
import { handleTypesafeProxy } from "./server/typesafe-proxy.js";

/** Dev/preview middleware: proxy Typesafe API using server-side TYPESAFE_API_KEY from .env */
export function typesafeProxyPlugin(): Plugin {
  const attach = (middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void }) => {
    middlewares.use((req, res, next) => {
      void handleTypesafeProxy(req, res)
        .then((handled) => {
          if (!handled) next();
        })
        .catch((error) => {
          res.statusCode = 500;
          res.end(error instanceof Error ? error.message : "Proxy error");
        });
    });
  };

  return {
    name: "typesafe-proxy",
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}
