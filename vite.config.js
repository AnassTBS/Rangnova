import contactHandler, { MAX_REQUEST_BYTES } from "./api/contact.js";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const CONTACT_ENV_KEYS = [
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
  "RESEND_API_KEY",
];

function contactApiPlugin() {
  return {
    name: "ringnova-local-contact-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== "/api/contact") {
          next();
          return;
        }

        const response = {
          status(statusCode) {
            res.statusCode = statusCode;
            return response;
          },
          setHeader(name, value) {
            res.setHeader(name, value);
            return response;
          },
          json(body) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(body));
            return response;
          },
        };

        try {
          if (req.method === "POST") {
            const chunks = [];
            let bodySize = 0;
            let bodyTooLarge = false;
            for await (const chunk of req) {
              bodySize += chunk.length;
              if (bodySize > MAX_REQUEST_BYTES) {
                bodyTooLarge = true;
              } else if (!bodyTooLarge) {
                chunks.push(chunk);
              }
            }
            if (bodyTooLarge) {
              response.status(413).json({ success: false, error: "Request body is too large." });
              return;
            }
            req.body = Buffer.concat(chunks).toString("utf8");
          }

          await contactHandler(req, response);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), "");
  for (const key of CONTACT_ENV_KEYS) {
    if (process.env[key] === undefined && localEnv[key] !== undefined) {
      process.env[key] = localEnv[key];
    }
  }

  return {
    plugins: [react(), contactApiPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/framer-motion")) {
              return "motion";
            }
          },
        },
      },
    },
  };
});
