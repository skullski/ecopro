import fs from 'node:fs/promises';
import path from 'node:path';

const WORKSPACE_ROOT = process.cwd();
const TEMPLATE_DIR = path.join(WORKSPACE_ROOT, 'client', 'pages', 'storefront', 'templates', 'gold');

const HEADER_LOGO_SNIPPET = `
          {asString(settings.store_logo) ? (
            <img
              src={asString(settings.store_logo)}
              alt={storeName}
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', marginRight: 10, verticalAlign: 'middle' }}
            />
          ) : null}
`;

const FOOTER_DESC_SNIPPET = `
        {(canManage || storeDescription) && (
          <p
            style={{ marginTop: 0, opacity: 0.8 }}
            data-edit-path="layout.footer.description"
            onClick={(e) => clickGuard(e, 'layout.footer.description')}
          >
            {storeDescription || (canManage ? 'Add store description...' : '')}
          </p>
        )}
`;

function hasBrokenHeaderOnClick(src: string): boolean {
  return src.includes("clickGuard(e, 'layout.header.logo')}") && src.includes('asString(settings.store_logo)') && src.includes('data-edit-path="layout.header.logo"');
}

function hasBrokenFooterOnClick(src: string): boolean {
  return src.includes("clickGuard(e, 'layout.footer')}") && src.includes('layout.footer.description') && src.includes('data-edit-path="layout.footer"');
}

function fixHeaderOnClick(src: string): { updated: string; changed: boolean } {
  let updated = src;
  let changed = false;

  // Remove injected logo JSX from the onClick handler for the logo marker.
  updated = updated.replace(
    /onClick=\{\(e\)\s*=>\s*[\s\S]*?clickGuard\(e,\s*['\"]layout\.header\.logo['\"]\)\s*\}/g,
    (m) => {
      // Only replace if it looks like our broken injection (contains store_logo).
      if (!m.includes('store_logo')) return m;
      changed = true;
      return "onClick={(e) => clickGuard(e, 'layout.header.logo')}";
    }
  );

  // Ensure the logo image JSX exists inside the header logo element, not in the onClick.
  if (!updated.includes('src={asString(settings.store_logo)}')) {
    updated = updated.replace(
      /(<h1[^>]*data-edit-path=\"layout\.header\.logo\"[^>]*>)/,
      (m) => {
        changed = true;
        return m + HEADER_LOGO_SNIPPET;
      }
    );
  }

  return { updated, changed };
}

function fixFooterOnClickAndMoveDescription(src: string): { updated: string; changed: boolean } {
  let updated = src;
  let changed = false;

  // Remove injected description JSX from the footer onClick handler.
  updated = updated.replace(
    /onClick=\{\(e\)\s*=>\s*[\s\S]*?clickGuard\(e,\s*['\"]layout\.footer['\"]\)\s*\}/g,
    (m) => {
      if (!m.includes('layout.footer.description')) return m;
      changed = true;
      return "onClick={(e) => clickGuard(e, 'layout.footer')}";
    }
  );

  // Insert footer description block into footer body if it's missing.
  if (!updated.includes('data-edit-path="layout.footer.description"') && updated.includes('const storeDescription')) {
    updated = updated.replace(
      /(<footer[^>]*data-edit-path=\"layout\.footer\"[^>]*>)/,
      (m) => {
        changed = true;
        return m + FOOTER_DESC_SNIPPET;
      }
    );
  }

  return { updated, changed };
}

async function listAllTemplateTsx(): Promise<string[]> {
  const entries = await fs.readdir(TEMPLATE_DIR, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !name.startsWith('__') && name !== 'types');

  const files: string[] = [];
  for (const d of dirs) {
    const full = path.join(TEMPLATE_DIR, d);
    const items = await fs.readdir(full, { withFileTypes: true });
    for (const it of items) {
      if (it.isFile() && it.name.endsWith('.tsx')) files.push(path.join(full, it.name));
    }
  }
  return files;
}

async function main() {
  const files = await listAllTemplateTsx();
  let changedFiles = 0;

  for (const filePath of files) {
    const original = await fs.readFile(filePath, 'utf8');
    let src = original;
    let changed = false;

    if (hasBrokenHeaderOnClick(src)) {
      const res = fixHeaderOnClick(src);
      src = res.updated;
      changed = changed || res.changed;
    }

    if (hasBrokenFooterOnClick(src)) {
      const res = fixFooterOnClickAndMoveDescription(src);
      src = res.updated;
      changed = changed || res.changed;
    }

    if (changed) {
      await fs.writeFile(filePath, src, 'utf8');
      changedFiles++;
      console.log(`fixed ${path.relative(WORKSPACE_ROOT, filePath)}`);
    }
  }

  console.log(`Done. Fixed ${changedFiles} files.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
