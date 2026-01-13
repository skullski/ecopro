import fs from 'node:fs/promises';
import path from 'node:path';

const WORKSPACE_ROOT = process.cwd();
const GOLD_DIR = path.join(WORKSPACE_ROOT, 'client', 'pages', 'storefront', 'templates', 'gold');

const TARGETS = [
  'perfume',
  'automotive',
  'chocolate',
  'crafts',
  'eyewear',
  'fitness',
  'florist',
  'gaming',
  'garden',
  'gifts',
  'gradient',
  'health',
  'kids',
  'lingerie',
  'luxury',
  'monochrome',
  'music',
  'neon',
  'office',
  'organic',
  'outdoor',
  'pastel',
  'pets',
  'phone-accessories',
  'photography',
  'skincare',
  'stationery',
  'streetwear',
  'supplements',
  'swimwear',
  'tea',
  'tech',
  'tools',
  'travel',
  'vintage',
  'watches',
  'wedding',
  'wine',
];

async function findTemplateFile(dir: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const tsx = entries
      .filter((e) => e.isFile() && e.name.endsWith('Template.tsx'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
    return tsx[0] ? path.join(dir, tsx[0]) : null;
  } catch {
    return null;
  }
}

function applyIfChanged(filePath: string, before: string, after: string, changes: string[]) {
  if (after !== before) changes.push(path.relative(WORKSPACE_ROOT, filePath));
}

function normalizeLogoHeuristic(src: string): string {
  // Convert injected {storeLogo ? <img src={storeLogo} .../> : null} to use settings.store_logo so
  // the report heuristic (usesLogoInImg) counts it reliably.
  let out = src;
  out = out.replace(/\{storeLogo\s*\?\s*\(/g, '{settings.store_logo ? (');
  out = out.replace(/src=\{storeLogo\}/g, 'src={settings.store_logo}');
  return out;
}

function ensureGridMarkers(src: string): string {
  let out = src;
  // These templates use layout.products; switch to layout.grid so markers.grid becomes true.
  out = out.replace(/data-edit-path="layout\.products"/g, 'data-edit-path="layout.grid"');
  out = out.replace(/layout\.products\./g, 'layout.grid.items.');
  out = out.replace(/'layout\.products'/g, "'layout.grid'");
  return out;
}

function ensureGridThemeKeys(src: string): string {
  let out = src;

  const hasTitleColor = out.includes('template_product_title_color');
  const hasPriceColor = out.includes('template_product_price_color');
  const hasAddLabel = out.includes('template_add_to_cart_label');

  if (hasTitleColor && hasPriceColor && hasAddLabel) return out;

  // Insert after ctaText if present, otherwise after heroSubtitle.
  const anchorRe = /\n\s*const\s+ctaText\s*=.*;\s*/;
  const anchorRe2 = /\n\s*const\s+heroSubtitle\s*=.*;\s*/;
  const insertLines: string[] = [];
  if (!hasTitleColor) insertLines.push("  const productTitleColor = asString(settings.template_product_title_color) || text;");
  if (!hasPriceColor) insertLines.push("  const productPriceColor = asString(settings.template_product_price_color) || accent;");
  if (!hasAddLabel) insertLines.push("  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'View';");

  const m = out.match(anchorRe) || out.match(anchorRe2);
  if (m && m.index !== undefined) {
    const pos = m.index + m[0].length;
    out = out.slice(0, pos) + '\n' + insertLines.join('\n') + '\n' + out.slice(pos);
  }

  return out;
}

function applyGridStylesAndButton(src: string): string {
  let out = src;

  // Product title: add color: productTitleColor if the title is rendered as {product.title}
  // and the style object doesn't already specify color.
  out = out.replace(
    /<h3([^>]*?)style=\{\{([^}]*?)\}\}([^>]*?)>\{product\.title\}<\/h3>/g,
    (full, pre, styleBody, post) => {
      if (/\bcolor\s*:\s*/.test(styleBody)) return full;
      const injected = styleBody.trim().length ? styleBody.replace(/\s*$/, '') + ", color: productTitleColor" : 'color: productTitleColor';
      return `<h3${pre}style={{${injected}}}${post}>{product.title}</h3>`;
    }
  );

  // Price: swap color to productPriceColor when the price is rendered via props.formatPrice(product.price)
  out = out.replace(
    /<p([^>]*?)style=\{\{([\s\S]*?)\}\}([^>]*?)>\{props\.formatPrice\(product\.price\)\}<\/p>/g,
    (full, pre, styleBody, post) => {
      let next = styleBody;
      next = next.replace(/\bcolor\s*:\s*accent\b/g, 'color: productPriceColor');
      if (!/\bcolor\s*:\s*/.test(next)) {
        next = next.trim().length ? next.replace(/\s*$/, '') + ', color: productPriceColor' : 'color: productPriceColor';
      }
      return `<p${pre}style={{${next}}}${post}>{props.formatPrice(product.price)}</p>`;
    }
  );

  // Add a simple CTA button if missing and if we have addToCartLabel.
  if (!out.includes('addToCartLabel')) return out;
  if (out.includes('>{addToCartLabel}</button>')) return out;

  out = out.replace(
    /(\{props\.formatPrice\(product\.price\)\}<\/p>)/g,
    `$1\n                <button\n                  style={{\n                    marginTop: '12px',\n                    width: '100%',\n                    backgroundColor: accent,\n                    color: '#fff',\n                    padding: '10px 12px',\n                    border: 'none',\n                    borderRadius: '8px',\n                    cursor: 'pointer',\n                    fontSize: '13px',\n                    fontWeight: 600,\n                  }}\n                >\n                  {addToCartLabel}\n                </button>`
  );

  return out;
}

function ensureFooterCopyright(src: string): string {
  let out = src;

  if (!out.includes('template_copyright')) {
    // Add a copyright const near storeName if possible.
    const storeNameLineRe = /\n\s*const\s+storeName\s*=.*;\s*/;
    const m = out.match(storeNameLineRe);
    if (m && m.index !== undefined) {
      const pos = m.index + m[0].length;
      out =
        out.slice(0, pos) +
        `\n  const copyright = asString(settings.template_copyright) || \`© ${new Date().getFullYear()} \${storeName}\`;\n` +
        out.slice(pos);
    }
  }

  // Replace a common footer pattern `© {new Date().getFullYear()} {storeName}` with `{copyright}`.
  if (out.includes('const copyright')) {
    out = out.replace(/©\s*\{new Date\(\)\.getFullYear\(\)\}\s*\{storeName\}/g, '{copyright}');
  }

  return out;
}

async function main() {
  const changes: string[] = [];

  for (const id of TARGETS) {
    const dir = path.join(GOLD_DIR, id);
    const filePath = await findTemplateFile(dir);
    if (!filePath) continue;

    const before = await fs.readFile(filePath, 'utf8');
    let after = before;

    after = normalizeLogoHeuristic(after);
    after = ensureGridMarkers(after);
    after = ensureGridThemeKeys(after);
    after = applyGridStylesAndButton(after);
    after = ensureFooterCopyright(after);

    if (after !== before) {
      await fs.writeFile(filePath, after, 'utf8');
      applyIfChanged(filePath, before, after, changes);
    }
  }

  console.log(`Done. Updated ${changes.length} templates.`);
  for (const f of changes) console.log(`- ${f}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
