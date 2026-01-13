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
    if (tsx.length) out.set(templateId, tsx[0]);
  }
  return out;
}

function usesLogoInImg(source: string): boolean {
  const re = /<img[^>]+src=\{[^}]*store_logo[^}]*\}[^>]*>/i;
  const re2 = /<img[^>]+src=\{[^}]*settings\.?\[?'?store_logo'?\]?[^}]*\}[^>]*>/i;
  return re.test(source) || re2.test(source);
}

function ensureStoreDescriptionConst(source: string): { updated: string; changed: boolean } {
  if (source.includes('store_description')) return { updated: source, changed: false };
  const reStoreName = /\n(\s*const\s+storeName\s*=\s*[^;]+;\s*)/;
  if (!reStoreName.test(source)) return { updated: source, changed: false };
  const updated = source.replace(reStoreName, (m, line) => `${m}\n  const storeDescription = asString(settings.store_description);\n`);
  return { updated, changed: updated !== source };
}

function ensureLogoRendered(source: string): { updated: string; changed: boolean } {
  if (usesLogoInImg(source)) return { updated: source, changed: false };

  // Inject an inline logo image at start of the header logo element.
  const re = /(<(h1|div)[^>]*data-edit-path=\"layout\.header\.logo\"[^>]*>)/;
  const m = source.match(re);
  if (!m) return { updated: source, changed: false };

  const inject =
    `${m[1]}\n          {asString(settings.store_logo) ? (\n            <img\n              src={asString(settings.store_logo)}\n              alt={storeName}\n              style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', marginRight: 10, verticalAlign: 'middle' }}\n            />\n          ) : null}`;

  const updated = source.replace(re, inject);
  return { updated, changed: updated !== source };
}

function ensureGridMarker(source: string): { updated: string; changed: boolean } {
  let updated = source;
  let changed = false;

  if (!updated.includes('data-edit-path="layout.grid"') && updated.includes('data-edit-path="layout.products"')) {
    updated = updated.replaceAll('data-edit-path="layout.products"', 'data-edit-path="layout.grid"');
    changed = true;
  }

  if (updated.includes('layout.products.')) {
    updated = updated.replaceAll('layout.products.', 'layout.grid.items.');
    changed = true;
  }

  return { updated, changed };
}

function useCopyrightInFooter(source: string): { updated: string; changed: boolean } {
  if (!source.includes('template_copyright')) return { updated: source, changed: false };
  if (!source.includes('data-edit-path="layout.footer"')) return { updated: source, changed: false };

  let updated = source;
  let changed = false;

  // Replace common hardcoded copyright patterns.
  const patterns: RegExp[] = [
    /©\s*\{new Date\(\)\.getFullYear\(\)\}\s*\{storeName\}[^<]*/g,
    /©\s*\{new Date\(\)\.getFullYear\(\)\}\s*\{storeName\}/g,
  ];

  for (const p of patterns) {
    if (p.test(updated)) {
      updated = updated.replace(p, '{copyright}');
      changed = true;
    }
  }

  // If we have storeDescription const, render it once in footer (helps “edits apply” in UI).
  if (updated.includes('const storeDescription =') && !updated.includes('{storeDescription}')) {
    updated = updated.replace(
      /(<footer[^>]*data-edit-path=\"layout\.footer\"[^>]*>)/,
      (m) => `${m}\n        {(canManage || storeDescription) && (\n          <p style={{ marginTop: 0, opacity: 0.8 }} data-edit-path=\"layout.footer.description\" onClick={(e) => clickGuard(e as any, \"layout.footer.description\")}>\n            {storeDescription || (canManage ? \"Add store description...\" : \"\")}\n          </p>\n        )}`
    );
    changed = true;
  }

  return { updated, changed };
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
      console.warn(`- skip ${id}: no file`);
      continue;
    }

    const original = await fs.readFile(filePath, 'utf8');
    let src = original;
    let changed = false;

    for (const step of [ensureStoreDescriptionConst, ensureLogoRendered, ensureGridMarker, useCopyrightInFooter]) {
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
