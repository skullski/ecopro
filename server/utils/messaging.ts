const WA_TOKEN = process.env.WHATSAPP_TOKEN || "";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";

/**
 * Send a plain text WhatsApp message using Meta WhatsApp Cloud API.
 * Expects E.164 phone format (e.g., +212xxxxxxxxx).
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string,
  opts?: { token?: string; phoneId?: string }
): Promise<void> {
  const token = opts?.token || WA_TOKEN;
  const phoneId = opts?.phoneId || WA_PHONE_ID;

  if (!token || !phoneId) {
    throw new Error("WhatsApp Cloud credentials not configured");
  }

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`WhatsApp send failed: ${res.status} ${errText}`);
  }
}
