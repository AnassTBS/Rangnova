import { Resend } from "resend";

const REQUIRED_FIELDS = ["firstName", "lastName", "email", "consent"];
export const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_LENGTHS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 40,
  jobFunction: 120,
  company: 150,
  industry: 120,
  country: 120,
  service: 120,
  source: 160,
  message: 4000,
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const normalizeValue = (value) => (typeof value === "string" ? value.trim() : "");

const getRequestBodySize = (body) => {
  if (body === undefined || body === null) return 0;
  if (typeof body === "string") return Buffer.byteLength(body, "utf8");
  if (Buffer.isBuffer(body)) return body.length;
  if (body instanceof Uint8Array) return body.byteLength;

  try {
    return Buffer.byteLength(JSON.stringify(body), "utf8");
  } catch {
    return Infinity;
  }
};

const rejectOversizedRequest = (req, res) => {
  const contentLength = req.headers["content-length"];
  if (contentLength !== undefined) {
    const parsedLength = Number(contentLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      res.status(400).json({ success: false, error: "Invalid request body." });
      return true;
    }
    if (parsedLength > MAX_REQUEST_BYTES) {
      res.status(413).json({ success: false, error: "Request body is too large." });
      return true;
    }
  }

  if (getRequestBodySize(req.body) > MAX_REQUEST_BYTES) {
    res.status(413).json({ success: false, error: "Request body is too large." });
    return true;
  }

  return false;
};

const isJsonContentType = (value) =>
  typeof value === "string" && /^application\/json(?:\s*;\s*charset=utf-8)?\s*$/i.test(value);

const buildEmailText = (payload) => {
  const lines = [
    "New website inquiry — Rangnova",
    "",
    `Name: ${payload.firstName} ${payload.lastName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "Not provided"}`,
    `Job function: ${payload.jobFunction || "Not provided"}`,
    `Company: ${payload.company || "Not provided"}`,
    `Industry: ${payload.industry || "Not provided"}`,
    `Country: ${payload.country || "Not provided"}`,
    `Service: ${payload.service || "Not provided"}`,
    `Source: ${payload.source || "Not provided"}`,
    `Message: ${payload.message || "Not provided"}`,
    `Consent: ${payload.consent ? "Yes" : "No"}`,
  ];

  return lines.join("\n");
};

export default async function handler(
  req,
  res,
  { createResendClient = (apiKey) => new Resend(apiKey) } = {},
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  if (!isJsonContentType(req.headers["content-type"])) {
    return res.status(415).json({ success: false, error: "Content-Type must be application/json." });
  }

  if (rejectOversizedRequest(req, res)) return;

  const apiKey = process.env.RESEND_API_KEY;
  const contactToEmail = process.env.CONTACT_TO_EMAIL;
  const contactFromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !contactToEmail || !contactFromEmail) {
    return res.status(500).json({ success: false, error: "Email service is not configured." });
  }

  let payload;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ success: false, error: "Invalid request body." });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ success: false, error: "Invalid request body." });
  }

  if (normalizeValue(payload.website)) {
    return res.status(400).json({ success: false, error: "Invalid request." });
  }

  const safePayload = {
    firstName: normalizeValue(payload.firstName),
    lastName: normalizeValue(payload.lastName),
    email: normalizeValue(payload.email),
    phone: normalizeValue(payload.phone),
    jobFunction: normalizeValue(payload.jobFunction),
    company: normalizeValue(payload.company),
    industry: normalizeValue(payload.industry),
    country: normalizeValue(payload.country),
    service: normalizeValue(payload.service),
    source: normalizeValue(payload.source),
    message: normalizeValue(payload.message),
    consent: payload.consent === true,
  };

  for (const field of REQUIRED_FIELDS) {
    const value = safePayload[field];
    if (field === "consent") {
      if (!value) {
        return res.status(400).json({ success: false, error: "Consent is required." });
      }
      continue;
    }

    if (!value) {
      return res.status(400).json({ success: false, error: `${field} is required.` });
    }
  }

  if (!isValidEmail(safePayload.email)) {
    return res.status(400).json({ success: false, error: "Please provide a valid email address." });
  }

  for (const [key, value] of Object.entries(safePayload)) {
    if (!(key in MAX_LENGTHS)) continue;
    if (value.length > MAX_LENGTHS[key]) {
      return res.status(400).json({ success: false, error: `${key} is too long.` });
    }
  }

  try {
    const resend = createResendClient(apiKey);
    const { error } = await resend.emails.send({
      from: contactFromEmail,
      to: [contactToEmail],
      replyTo: safePayload.email,
      subject: "New website inquiry — Rangnova",
      text: buildEmailText(safePayload),
    });

    if (error) {
      console.error("Resend email failed", error);
      return res.status(502).json({ success: false, error: "Unable to send your inquiry right now. Please try again later." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Resend email failed", error);
    return res.status(502).json({ success: false, error: "Unable to send your inquiry right now. Please try again later." });
  }
}
