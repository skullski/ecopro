import 'dotenv/config';

async function main() {
  const storeSlug = (process.argv[2] || '').trim();
  if (!storeSlug) {
    console.error('Usage: tsx tmp/check-telegram-bot-link.ts <storeSlug>');
    process.exit(1);
  }

  const baseUrl = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
  const url = `${baseUrl}/api/telegram/bot-link/${encodeURIComponent(storeSlug)}`;
  const res = await fetch(url);
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
