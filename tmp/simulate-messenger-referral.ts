import 'dotenv/config';

// Simulate a minimal Messenger webhook referral event.
// This hits the local server /api/messenger/webhook and should:
// - mark messenger_preconnect_tokens.used_at
// - insert/update customer_messaging_ids.messenger_psid for the token's phone
// - insert messenger_subscribers row
//
// NOTE: Signature verification is skipped if FB_APP_SECRET is not set.

async function main() {
  const baseUrl = process.env.LOCAL_API_BASE_URL || 'http://localhost:8080';

  const pageId = process.env.SIM_PAGE_ID || '929814950220320';
  const senderId = process.env.SIM_SENDER_PSID || 'SIM_PSID_1234567890';
  const refToken = process.env.SIM_REF_TOKEN;

  if (!refToken) {
    console.error('Missing SIM_REF_TOKEN in env');
    process.exitCode = 1;
    return;
  }

  const body = {
    object: 'page',
    entry: [
      {
        id: pageId,
        time: Date.now(),
        messaging: [
          {
            sender: { id: senderId },
            recipient: { id: pageId },
            timestamp: Date.now(),
            referral: {
              ref: refToken,
              source: 'SHORTLINK',
              type: 'OPEN_THREAD',
            },
          },
        ],
      },
    ],
  };

  const res = await fetch(`${baseUrl}/api/messenger/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => '');
  console.log('STATUS', res.status);
  if (text) console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
