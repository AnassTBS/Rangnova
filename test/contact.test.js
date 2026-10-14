import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import handler from "../api/contact.js";

const environmentKeys = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"];
const originalEnvironment = Object.fromEntries(
  environmentKeys.map((key) => [key, process.env[key]]),
);

afterEach(() => {
  for (const key of environmentKeys) {
    if (originalEnvironment[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnvironment[key];
    }
  }
});

function configureEmail() {
  process.env.RESEND_API_KEY = "test-api-key";
  process.env.CONTACT_TO_EMAIL = "inbox@example.com";
  process.env.CONTACT_FROM_EMAIL = "Rangnova <contact@example.com>";
}

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function makeRequest({ method = "POST", headers = {}, body } = {}) {
  return {
    method,
    headers: { "content-type": "application/json", ...headers },
    body,
  };
}

const validPayload = {
  firstName: "  Ada ",
  lastName: " Lovelace  ",
  email: " ada@example.com ",
  consent: true,
  company: "Analytical Engines",
  message: "Please contact me.",
};

test("rejects methods other than POST", async () => {
  const response = makeResponse();
  await handler(makeRequest({ method: "GET" }), response);
  assert.equal(response.statusCode, 405);
  assert.deepEqual(response.body, { success: false, error: "Method not allowed." });
});

test("rejects non-JSON requests", async () => {
  const response = makeResponse();
  await handler(
    makeRequest({ headers: { "content-type": "text/plain" } }),
    response,
  );
  assert.equal(response.statusCode, 415);
});

test("rejects requests that exceed the body limit", async () => {
  configureEmail();
  const response = makeResponse();
  await handler(
    makeRequest({
      headers: { "content-length": String(16 * 1024 + 1) },
      body: JSON.stringify(validPayload),
    }),
    response,
  );
  assert.equal(response.statusCode, 413);
});

test("reports missing email configuration without attempting delivery", async () => {
  for (const key of environmentKeys) delete process.env[key];
  const response = makeResponse();
  let clientCreated = false;
  await handler(makeRequest({ body: validPayload }), response, {
    createResendClient() {
      clientCreated = true;
      throw new Error("Email client must not be created.");
    },
  });
  assert.equal(response.statusCode, 500);
  assert.equal(clientCreated, false);
});

test("rejects invalid submissions without attempting delivery", async () => {
  configureEmail();
  const response = makeResponse();
  let clientCreated = false;
  await handler(makeRequest({ body: { ...validPayload, consent: false } }), response, {
    createResendClient() {
      clientCreated = true;
      throw new Error("Email client must not be created.");
    },
  });
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { success: false, error: "Consent is required." });
  assert.equal(clientCreated, false);
});

test("sends a validated, normalized inquiry through the configured email client", async () => {
  configureEmail();
  const response = makeResponse();
  let apiKey;
  let email;
  await handler(makeRequest({ body: JSON.stringify(validPayload) }), response, {
    createResendClient(key) {
      apiKey = key;
      return {
        emails: {
          async send(message) {
            email = message;
            return { error: null };
          },
        },
      };
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { success: true });
  assert.equal(apiKey, "test-api-key");
  assert.deepEqual(email, {
    from: "Rangnova <contact@example.com>",
    to: ["inbox@example.com"],
    replyTo: "ada@example.com",
    subject: "New website inquiry — Rangnova",
    text: [
      "New website inquiry — Rangnova",
      "",
      "Name: Ada Lovelace",
      "Email: ada@example.com",
      "Phone: Not provided",
      "Job function: Not provided",
      "Company: Analytical Engines",
      "Industry: Not provided",
      "Country: Not provided",
      "Service: Not provided",
      "Source: Not provided",
      "Message: Please contact me.",
      "Consent: Yes",
    ].join("\n"),
  });
});

test("returns a delivery error when the email provider rejects the message", async () => {
  configureEmail();
  const response = makeResponse();
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    await handler(makeRequest({ body: validPayload }), response, {
      createResendClient() {
        return { emails: { async send() { return { error: new Error("provider error") }; } } };
      },
    });
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(response.statusCode, 502);
  assert.equal(response.body.success, false);
});

test("returns a delivery error when email client creation fails", async () => {
  configureEmail();
  const response = makeResponse();
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    await handler(makeRequest({ body: validPayload }), response, {
      createResendClient() {
        throw new Error("client creation failed");
      },
    });
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(response.statusCode, 502);
  assert.equal(response.body.success, false);
});
