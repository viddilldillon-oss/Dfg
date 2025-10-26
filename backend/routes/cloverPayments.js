// backend/routes/cloverPayments.js
const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

/**
 * Normalizes the amount coming from the client:
 * - If client sent amount as cents (number >= 100), we keep it.
 * - If client sent amount as dollars (like 19.99), convert to cents.
 * - Always returns an integer >= 0.
 */
function toCents(raw) {
  if (raw == null) return 0;
  const num = Number(raw);
  if (!Number.isFinite(num)) return 0;
  // If looks like dollars (e.g. 19.99), convert
  if (num < 100) return Math.round(num * 100);
  // Already cents
  return Math.round(num);
}

/**
 * Builds the Clover configuration from environment variables.
 * Supports sandbox/live via CLOVER_MODE.
 */
function getCloverConfig() {
  const isLive = (process.env.CLOVER_MODE || "live").toLowerCase() === "live";

  const merchantId = isLive
    ? process.env.CLOVER_LIVE_MERCHANT_ID
    : process.env.CLOVER_SANDBOX_MERCHANT_ID || process.env.CLOVER_MERCHANT_ID;

  const privateKey = isLive
    ? process.env.CLOVER_LIVE_PRIVATE_KEY || process.env.CLOVER_PRIVATE_KEY
    : process.env.CLOVER_SANDBOX_PRIVATE_KEY || process.env.CLOVER_PRIVATE_KEY;

  // Base domains (Hosted Checkout lives outside /v3)
  const primaryDomain = isLive ? "https://www.clover.com" : "https://sandbox.dev.clover.com";
  const altDomain = isLive ? "https://api.clover.com" : "https://sandbox.dev.clover.com";

  // Primary hosted checkout endpoint; we’ll try this first
  const primaryHostedCheckout = `${primaryDomain}/invoicingcheckoutservice/v1/checkouts`;
  // Alternate (some tenants respond here)
  const altHostedCheckout = `${altDomain}/invoicingcheckoutservice/v1/checkouts`;

  const successUrl = process.env.CLOVER_SUCCESS_URL || "https://dfg-qq0j.onrender.com/checkout-success.html";
  const cancelUrl  = process.env.CLOVER_CANCEL_URL  || "https://dfg-qq0j.onrender.com/checkout-cancel.html";
  const failureUrl = process.env.CLOVER_FAILURE_URL || "https://dfg-qq0j.onrender.com/checkout-failed.html";

  return {
    isLive,
    merchantId,
    privateKey,
    endpoints: [primaryHostedCheckout, altHostedCheckout],
    redirects: { successUrl, cancelUrl, failureUrl }
  };
}

/**
 * Attempts the POST to Clover Hosted Checkout.
 * Tries endpoints in order until one returns 2xx with a usable URL.
 */
async function createHostedCheckout({ amountInCents, email }) {
  const cfg = getCloverConfig();

  if (!cfg.privateKey) {
    throw new Error("Clover private key is missing. Set CLOVER_LIVE_PRIVATE_KEY (live) or CLOVER_SANDBOX_PRIVATE_KEY (sandbox).");
  }
  if (!cfg.merchantId) {
    throw new Error("Clover merchant ID is missing. Set CLOVER_LIVE_MERCHANT_ID or CLOVER_SANDBOX_MERCHANT_ID.");
  }
  if (!amountInCents || amountInCents < 1) {
    throw new Error("Invalid amount. Must be >= 1 cent.");
  }

  const payload = {
    total: amountInCents,
    currency: "usd",
    redirect: {
      success: cfg.redirects.successUrl,
      cancel: cfg.redirects.cancelUrl,
      failure: cfg.redirects.failureUrl
    },
    // Optional: helpful metadata for reconciliation
    metadata: {
      merchantId: cfg.merchantId,
      email: email || undefined
    }
  };

  const headers = {
    "Authorization": `Bearer ${cfg.privateKey}`,
    "Content-Type": "application/json"
  };

  // Try each endpoint until one succeeds
  for (const url of cfg.endpoints) {
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const raw = await resp.text();
    let data = null;
    try { data = JSON.parse(raw); } catch { /* not JSON, handled below */ }

    console.log("────────────────────────────────────────────────────────");
    console.log("🌐 Clover request →", url);
    console.log("🔢 Status:", resp.status);
    console.log("🔐 Key prefix:", (cfg.privateKey || "").slice(0, 6));
    console.log("📤 Payload:", JSON.stringify(payload));
    console.log("📥 Raw (first 300):", raw.slice(0, 300));

    // Success paths we recognize
    const href =
      (data && (data.checkoutPageUrl || data?.checkoutUrl || data?._links?.checkout?.href)) ||
      null;

    if (resp.ok && href) {
      console.log("✅ Hosted Checkout URL:", href);
      return { href, status: resp.status, endpoint: url, data };
    }

    // If 401/403/405 or 5xx, continue to next endpoint
    if ([401, 403, 405, 500, 502, 503].includes(resp.status)) {
      console.warn(`⚠️ Clover responded ${resp.status} at ${url}. Trying next endpoint…`);
      continue;
    }

    // For other 4xx errors, throw immediately
    if (resp.status >= 400) {
      throw new Error(`Clover error ${resp.status}: ${raw}`);
    }
  }

  throw new Error("All Clover endpoints failed to return a hosted checkout URL.");
}

/**
 * POST /api/clover/start
 * Body: { amount, currency?, email? }
 * - amount may be dollars (e.g. 19.99) or cents (e.g. 1999). We normalize.
 */
router.post("/start", express.json(), async (req, res) => {
  try {
    const { amount, amountCents, currency = "usd", email } = req.body || {};

    // Normalize amount to cents
    const cents = amountCents != null ? toCents(amountCents) : toCents(amount);
    if (!cents || cents < 1) {
      return res.status(400).json({ ok: false, error: "Invalid amount. Provide amount or amountCents." });
    }
    if ((currency || "").toLowerCase() !== "usd") {
      console.warn("⚠️ Currently forcing currency=USD for Clover Hosted Checkout payload.");
    }

    const result = await createHostedCheckout({ amountInCents: cents, email });
    return res.json({ ok: true, href: result.href, cloverStatus: result.status, endpoint: result.endpoint });

  } catch (err) {
    console.error("❌ Clover Hosted Checkout creation failed:", err?.message || err);
    return res.status(500).json({ ok: false, error: err?.message || "Internal Server Error" });
  }
});

module.exports = router;