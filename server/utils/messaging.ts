const WA_TOKEN = process.env.WHATSAPP_TOKEN || "";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";

/**
 * Send a plain text WhatsApp message using Meta WhatsApp Cloud API.
 * Expects E.164 phone format (e.g., +212xxxxxxxxx).
 */
export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  if (!WA_TOKEN || !WA_PHONE_ID) {
    throw new Error("WhatsApp env vars not configured");
  }
  const url = `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`WhatsApp send failed: ${res.status} ${errText}`);
  }
}
