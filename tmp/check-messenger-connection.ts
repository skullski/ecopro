import 'dotenv/config';

async function main() {
  const baseUrl = process.env.LOCAL_API_BASE_URL || 'http://localhost:8080';
  const storeSlug = process.env.SIM_STORE_SLUG || 'store-rips8454';
  const phone = process.env.SIM_PHONE;

  if (!phone) {
    console.error('Missing SIM_PHONE in env');
    process.exitCode = 1;
    return;
  }

  const res = await fetch(`${baseUrl}/api/messenger/check-connection/${encodeURIComponent(storeSlug)}?phone=${encodeURIComponent(phone)}`);
  const data = await res.json().catch(() => null);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
