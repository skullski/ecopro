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

function findTemplateFile(dir: string): Promise<string | null> {
  return fs
    .readdir(dir, { withFileTypes: true })
    .then((entries) => {
      const tsx = entries
        .filter((e) => e.isFile() && e.name.endsWith('Template.tsx'))
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b));
      return tsx[0] ? path.join(dir, tsx[0]) : null;
    })
    .catch(() => null);
}

function insertAfter(haystack: string, needle: string, insert: string): string {
  const idx = haystack.indexOf(needle);
  if (idx === -1) return haystack;
  const at = idx + needle.length;
  return haystack.slice(0, at) + insert + haystack.slice(at);
}

function ensureStoreIdentityVars(src: string): string {
  const needsLogo = !src.includes('settings.store_logo') && !src.includes("settings['store_logo']");
  const needsDesc = !src.includes('settings.store_description') && !src.includes("settings['store_description']");

  if (!needsLogo && !needsDesc) return src;

  const linesToAdd: string[] = [];
  if (needsLogo) linesToAdd.push("  const storeLogo = asString(settings.store_logo);");
  if (needsDesc) linesToAdd.push("  const storeDescription = asString(settings.store_description);");

  // Insert right after the storeName constant (covers both `settings.store_name` and wrappers like `asString(settings.store_name)`).
  const storeNameLineRe = /\n\s*const\s+storeName\s*=.*store_name[^;]*;\s*/;
  const match = src.match(storeNameLineRe);
  if (match && match.index !== undefined) {
    const insertPos = match.index + match[0].length;
    return src.slice(0, insertPos) + '\n' + linesToAdd.join('\n') + '\n' + src.slice(insertPos);
  }

  // Fallback: insert after settings initialization.
  const settingsLineRe = /\n\s*const\s+settings\s*=\s*props\.settings[^;]*;\s*/;
  const match2 = src.match(settingsLineRe);
  if (match2 && match2.index !== undefined) {
    const insertPos = match2.index + match2[0].length;
    return src.slice(0, insertPos) + '\n' + linesToAdd.join('\n') + '\n' + src.slice(insertPos);
  }

  return src;
}

function ensureLogoRenderedInHeader(src: string): string {
  if (!src.includes('data-edit-path="layout.header.logo"')) return src;
  if (/<img[^>]+src=\{[^}]*storeLogo[^}]*\}[^>]*>/.test(src)) return src;

  // If the template already renders the logo from settings directly, don't inject another one.
  const alreadyUsesSettingsLogoImg =
    /<img[^>]+src=\{[^}]*settings\.?\[?'?store_logo'?.*\}[^>]*>/i.test(src) ||
    /<img[^>]+src=\{[^}]*settings\.store_logo[^}]*\}[^>]*>/i.test(src);
  if (alreadyUsesSettingsLogoImg) return src;

  const findJsxOpeningTagEnd = (input: string, start: number): number => {
    // Find the '>' that ends the JSX opening tag, ignoring any '>' characters inside
    // JS expressions (e.g., arrow functions `=>`) or quoted strings.
    let braceDepth = 0;
    let quote: '"' | "'" | '`' | null = null;

    for (let i = start; i < input.length; i++) {
      const ch = input[i];

      if (quote) {
        if (ch === '\\') {
          i += 1;
          continue;
        }
        if (ch === quote) quote = null;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch as any;
        continue;
      }

      if (ch === '{') {
        braceDepth += 1;
        continue;
      }
      if (ch === '}') {
        if (braceDepth > 0) braceDepth -= 1;
        continue;
      }

      if (ch === '>' && braceDepth === 0) return i;
    }

    return -1;
  };

  // Find the first tag that has data-edit-path="layout.header.logo" and inject the img right after its opening tag.
  const marker = 'data-edit-path="layout.header.logo"';
  const markerIdx = src.indexOf(marker);
  if (markerIdx === -1) return src;

  const tagStart = src.lastIndexOf('<', markerIdx);
  if (tagStart === -1) return src;
  const tagEnd = findJsxOpeningTagEnd(src, tagStart);
  if (tagEnd === -1) return src;

  const openingTag = src.slice(tagStart, tagEnd + 1);
  const inject =
    "{storeLogo ? (" +
    "<img src={storeLogo} alt={storeName} style={{ width: 40, height: 40, borderRadius: '9999px', objectFit: 'cover' }} />" +
    ") : null}";

  // Avoid injecting if this element is self-closing (unlikely for header logo, but be safe).
  if (/\/\s*>$/.test(openingTag)) return src;

  return src.slice(0, tagEnd + 1) + inject + src.slice(tagEnd + 1);
}

function ensureDescriptionVisibleInFooter(src: string): string {
  if (!src.includes('storeDescription')) return src;

  // Try to find a footer paragraph that includes {storeName} and inject storeDescription right after it.
  const footerParaRe = /(<footer[\s\S]*?<p[^>]*>[\s\S]*?\{storeName\})([\s\S]*?<\/p>)/m;
  const match = src.match(footerParaRe);
  if (!match) return src;

  // If storeDescription already injected, skip.
  if (match[0].includes('storeDescription ?')) return src;

  const replacement = match[1] + "{storeDescription ? ` — ${storeDescription}` : ''}" + match[2];
  return src.replace(footerParaRe, replacement);
}

async function main() {
  let changed = 0;
  const changedFiles: string[] = [];

  for (const templateId of TARGETS) {
    const dir = path.join(GOLD_DIR, templateId);
    const filePath = await findTemplateFile(dir);
    if (!filePath) {
      console.warn(`[skip] ${templateId}: no *Template.tsx found`);
      continue;
    }

    const before = await fs.readFile(filePath, 'utf8');
    let after = before;

    after = ensureStoreIdentityVars(after);
    after = ensureLogoRenderedInHeader(after);
    after = ensureDescriptionVisibleInFooter(after);

    if (after !== before) {
      await fs.writeFile(filePath, after, 'utf8');
      changed += 1;
      changedFiles.push(path.relative(WORKSPACE_ROOT, filePath));
    }
  }

  console.log(`Done. Updated ${changed} templates.`);
  for (const f of changedFiles) console.log(`- ${f}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
