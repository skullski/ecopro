import fs from 'node:fs/promises';
import path from 'node:path';

const WORKSPACE_ROOT = process.cwd();
const REPORT_PATH = path.join(WORKSPACE_ROOT, 'docs', 'TEMPLATE_EDITABILITY_REPORT.md');
const TEMPLATE_DIR = path.join(WORKSPACE_ROOT, 'client', 'pages', 'storefront', 'templates', 'gold');

function sectionBetween(md: string, heading: string): string {
  const start = md.indexOf(heading);
  if (start < 0) return '';
  const rest = md.slice(start);
  const next = rest.indexOf('\n## ', 5);
  return next > 0 ? rest.slice(0, next) : rest;
}

async function listTemplateFilesById(): Promise<Map<string, string>> {
  const entries = await fs.readdir(TEMPLATE_DIR, { withFileTypes: true });
  const templateIds = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !name.startsWith('__') && name !== 'types');

  const out = new Map<string, string>();

  for (const templateId of templateIds) {
    const dirPath = path.join(TEMPLATE_DIR, templateId);
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const tsx = files
      .filter((f) => f.isFile() && f.name.endsWith('.tsx'))
      .map((f) => path.join(dirPath, f.name));
    if (tsx.length === 0) continue;
    // Most templates have exactly one TSX file.
    out.set(templateId, tsx[0]);
  }

  return out;
}

function ensureRootMarker(source: string): { updated: string; changed: boolean } {
  if (source.includes('data-edit-path="__root"') || source.includes("data-edit-path='__root'")) {
    return { updated: source, changed: false };
  }

  // Look for the first opening tag in the returned JSX. Most templates start with <div ...>
  const idx = source.indexOf('return (');
  if (idx < 0) return { updated: source, changed: false };

  const after = source.slice(idx);
  const divMatch = after.match(/\n\s*<div(\s|>)/);
  if (!divMatch || divMatch.index == null) return { updated: source, changed: false };

  const insertAt = idx + divMatch.index + divMatch[0].indexOf('<div') + '<div'.length;

  const hasCanManage = /\bconst\s+canManage\s*=/.test(source) || /\bcanManage\b/.test(source);
  const hasOnSelectFn = /\bconst\s+onSelect\s*=/.test(source) || /\bonSelect\b/.test(source);

  const rootAttrs = [
    '\n      data-edit-path="__root"',
    hasCanManage && hasOnSelectFn ? '\n      onClick={() => canManage && onSelect("__root")}' : '',
  ].join('');

  const updated = source.slice(0, insertAt) + rootAttrs + source.slice(insertAt);
  return { updated, changed: true };
}

function ensureStoreDescriptionWiring(source: string): { updated: string; changed: boolean } {
  if (source.includes('store_description')) return { updated: source, changed: false };

  // Common pattern in many templates
  const re1 = /const\s+descText\s*=\s*asString\(settings\.template_description_text\)\s*;\s*/;
  if (re1.test(source)) {
    const updated = source.replace(
      re1,
      'const descText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();\n'
    );
    return { updated, changed: true };
  }

  // Sometimes named descriptionText
  const re2 = /const\s+descriptionText\s*=\s*\(asString\(settings\.template_description_text\)\s*\|\|\s*asString\(settings\.store_description\)\)\.trim\(\)\s*;\s*/;
  if (re2.test(source)) return { updated: source, changed: false };

  return { updated: source, changed: false };
}

function ensureGridColorConsts(source: string): { updated: string; changed: boolean } {
  let updated = source;
  let changed = false;

  if (!updated.includes('template_product_title_color')) {
    // Insert after the template_accent_color line if present.
    const anchor = updated.match(/\n\s*const\s+accent\s*=\s*[^;]+;\s*/);
    if (anchor && anchor.index != null) {
      const insertAt = anchor.index + anchor[0].length;
      updated =
        updated.slice(0, insertAt) +
        `\n\n  const productTitleColor = asString(settings.template_product_title_color) || text;\n  const productPriceColor = asString(settings.template_product_price_color) || accent;\n` +
        updated.slice(insertAt);
      changed = true;
    }
  }

  if (!updated.includes('template_card_bg')) {
    const anchor = updated.match(/\n\s*const\s+productPriceColor\s*=\s*[^;]+;\s*/);
    if (anchor && anchor.index != null) {
      const insertAt = anchor.index + anchor[0].length;
      updated = updated.slice(0, insertAt) + `\n  const cardBg = asString(settings.template_card_bg) || "#ffffff";\n` + updated.slice(insertAt);
      changed = true;
    }
  }

  return { updated, changed };
}

function ensureFeaturedConsts(source: string): { updated: string; changed: boolean } {
  let updated = source;
  let changed = false;

  if (!updated.includes('template_featured_title')) {
    const anchor = updated.match(/\n\s*const\s+products\s*=\s*[^;]+;\s*/);
    if (anchor && anchor.index != null) {
      const insertAt = anchor.index + anchor[0].length;
      updated =
        updated.slice(0, insertAt) +
        `\n\n  const sectionTitle = asString(settings.template_featured_title) || "Featured";\n  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";\n  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";\n` +
        updated.slice(insertAt);
      changed = true;
    }
  }

  return { updated, changed };
}

function wireGridHeaderAndCardColors(source: string): { updated: string; changed: boolean } {
  let updated = source;
  let changed = false;

  // Wire grid header: only if the grid section exists and does NOT already use sectionTitle.
  if (updated.includes('data-edit-path="layout.grid"') && !updated.includes('{sectionTitle}')) {
    // Replace first H2 in the grid section.
    updated = updated.replace(
      /(<section[^>]*data-edit-path=\"layout\.grid\"[\s\S]*?<h2)([^>]*>)([\s\S]*?)(<\/h2>)/,
      (_m, a, b, _inner, d) => {
        changed = true;
        return `${a} data-edit-path=\"layout.featured.title\"${b}{sectionTitle}${d}`;
      }
    );

    // Replace first paragraph after that H2 (subtitle).
    updated = updated.replace(
      /(<section[^>]*data-edit-path=\"layout\.grid\"[\s\S]*?<h2[\s\S]*?<\/h2>[\s\S]*?<p)([^>]*>)([\s\S]*?)(<\/p>)/,
      (_m, a, b, _inner, d) => {
        changed = true;
        return `${a} data-edit-path=\"layout.featured.subtitle\"${b}{sectionSubtitle}${d}`;
      }
    );
  }

  // Card background: try to replace hardcoded card backgrounds in product card container.
  if (updated.includes('data-edit-path="layout.grid"') && updated.includes('template_card_bg')) {
    updated = updated.replace(
      /background:\s*['"]#f5f0eb['"]/g,
      () => {
        changed = true;
        return 'background: cardBg';
      }
    );
  }

  // Product title color: add color when style object exists and doesn't already have color.
  updated = updated.replace(/<h3([^>]*?)style=\{\{([\s\S]*?)\}\}([^>]*)>/g, (m, a, styleBody, c) => {
    if (!updated.includes('template_product_title_color')) return m;
    if (/\bcolor\s*:/.test(styleBody)) return m;
    changed = true;
    return `<h3${a}style={{${styleBody}, color: productTitleColor}}${c}>`;
  });

  // Product price color: replace color: accent or add color.
  updated = updated.replace(/<p([^>]*?)style=\{\{([\s\S]*?)\}\}([^>]*)>/g, (m, a, styleBody, c) => {
    if (!updated.includes('template_product_price_color')) return m;
    if (!/formatPrice\(|price\b/.test(updated.slice(updated.indexOf(m), updated.indexOf(m) + 300))) return m;
    if (/\bcolor\s*:\s*accent\b/.test(styleBody)) {
      changed = true;
      return `<p${a}style={{${styleBody.replace(/\bcolor\s*:\s*accent\b/, 'color: productPriceColor')}}}${c}>`;
    }
    if (/\bcolor\s*:/.test(styleBody)) return m;
    changed = true;
    return `<p${a}style={{${styleBody}, color: productPriceColor}}${c}>`;
  });

  return { updated, changed };
}

function ensureFooterCopyright(source: string): { updated: string; changed: boolean } {
  if (source.includes('template_copyright')) return { updated: source, changed: false };

  // Insert const copyright if footer exists.
  if (!source.includes('data-edit-path="layout.footer"')) return { updated: source, changed: false };

  const anchor = source.match(/\n\s*const\s+storeName\s*=\s*[^;]+;\s*/);
  if (!anchor || anchor.index == null) return { updated: source, changed: false };

  const insertAt = anchor.index + anchor[0].length;
  const updated =
    source.slice(0, insertAt) +
    `\n  const copyright = asString(settings.template_copyright) || \`© \${new Date().getFullYear()} \${storeName}\`;\n` +
    source.slice(insertAt);

  // Replace common hardcoded copyright line.
  const final = updated.replace(/©\s*\{new Date\(\)\.getFullYear\(\)\}\s*\{storeName\}\.\s*All rights reserved\./g, '{copyright}');

  return { updated: final, changed: true };
}

async function main() {
  const report = await fs.readFile(REPORT_PATH, 'utf8');
  const block = sectionBetween(report, '## Per-template coverage');
  const rows = [...block.matchAll(/^\| ([a-z0-9-]+) \| (\d+)% \|/gm)].map((m) => ({ id: m[1], pct: Number(m[2]) }));
  const remaining = rows.filter((r) => r.pct < 100);

  console.log(`Found ${remaining.length} templates below 100%`);

  const files = await listTemplateFilesById();

  let changedFiles = 0;
  for (const { id, pct } of remaining) {
    const filePath = files.get(id);
    if (!filePath) {
      console.warn(`- skip ${id}: no TSX file found`);
      continue;
    }

    const original = await fs.readFile(filePath, 'utf8');
    let src = original;
    let changed = false;

    for (const step of [
      ensureRootMarker,
      ensureStoreDescriptionWiring,
      ensureGridColorConsts,
      ensureFeaturedConsts,
      wireGridHeaderAndCardColors,
      ensureFooterCopyright,
    ]) {
      const res = step(src);
      src = res.updated;
      changed = changed || res.changed;
    }

    if (changed) {
      await fs.writeFile(filePath, src, 'utf8');
      changedFiles++;
      console.log(`- updated ${id} (${pct}%)`);
    } else {
      console.log(`- no-op ${id} (${pct}%)`);
    }
  }

  console.log(`Done. Changed ${changedFiles} files.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
