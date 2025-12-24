import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'color' | 'image' | 'url' | 'json';

type InferredField = {
  key: string;
  label: string;
  type: FieldType;
  defaultValue?: unknown;
  sources: string[];
};

type TemplateExtraction = {
  templateId: string;
  filePath: string;
  fields: Record<string, InferredField>;
};

const WORKSPACE_ROOT = process.cwd();
const TEMPLATE_DIR = path.join(WORKSPACE_ROOT, 'client', 'components', 'templates');
const OUT_FILE = path.join(WORKSPACE_ROOT, 'client', 'lib', 'generatedTemplateSettings.ts');

function isStringLiteral(node: ts.Node): node is ts.StringLiteral {
  return ts.isStringLiteral(node);
}

function isNumberLiteral(node: ts.Node): node is ts.NumericLiteral {
  return ts.isNumericLiteral(node);
}

function isBooleanLiteral(node: ts.Node): node is ts.BooleanLiteral {
  return node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword;
}

function getBooleanValue(node: ts.BooleanLiteral): boolean {
  return node.kind === ts.SyntaxKind.TrueKeyword;
}

function labelFromKey(key: string): string {
  return key
    .replace(/^template_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferType(key: string, defaultValue: unknown): FieldType {
  const lower = key.toLowerCase();

  if (typeof defaultValue === 'boolean') return 'checkbox';
  if (typeof defaultValue === 'number') return 'number';

  if (lower.includes('color')) return 'color';
  if (lower.endsWith('_url') || lower.includes('logo') || lower.includes('banner') || lower.includes('image')) return 'image';
  if (lower.includes('link') || lower.includes('href')) return 'url';
  if (lower.includes('faq') || lower.includes('testimonials') || lower.includes('social_links')) return 'json';
  if (lower.includes('description') || lower.includes('subtitle') || lower.includes('about') || lower.includes('footer')) return 'textarea';

  return 'text';
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.keys(v)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = (v as any)[key];
          return acc;
        }, {});
    }
    return v;
  }, 2);
}

function addKey(extraction: TemplateExtraction, key: string, source: string, defaultValue?: unknown) {
  const existing = extraction.fields[key];
  const label = labelFromKey(key);

  const resolvedDefault = defaultValue !== undefined ? defaultValue : existing?.defaultValue;
  const fieldType = inferType(key, resolvedDefault);

  const merged: InferredField = {
    key,
    label,
    type: fieldType,
    ...(resolvedDefault !== undefined ? { defaultValue: resolvedDefault } : {}),
    sources: Array.from(new Set([...(existing?.sources || []), source])),
  };

  extraction.fields[key] = merged;
}

function getSettingsKeyFromAccess(node: ts.Node): string | null {
  // settings.foo
  if (ts.isPropertyAccessExpression(node)) {
    if (ts.isIdentifier(node.expression) && node.expression.text === 'settings') {
      return node.name.text;
    }
  }

  // settings['foo']
  if (ts.isElementAccessExpression(node)) {
    if (ts.isIdentifier(node.expression) && node.expression.text === 'settings') {
      const arg = node.argumentExpression;
      if (arg && isStringLiteral(arg)) return arg.text;
    }
  }

  return null;
}

function getLiteralValue(node: ts.Node): unknown | undefined {
  if (isStringLiteral(node)) return node.text;
  if (isNumberLiteral(node)) return Number(node.text);
  if (isBooleanLiteral(node)) return getBooleanValue(node);
  return undefined;
}

function extractDefaultsFromInitializer(node: ts.Expression): { key: string; defaultValue?: unknown } | null {
  // settings.foo || 'x'
  // settings.foo ?? 'x'
  if (ts.isBinaryExpression(node)) {
    const op = node.operatorToken.kind;
    if (op !== ts.SyntaxKind.BarBarToken && op !== ts.SyntaxKind.QuestionQuestionToken) return null;

    const key = getSettingsKeyFromAccess(node.left);
    if (!key) return null;

    const defaultValue = getLiteralValue(node.right);
    return { key, ...(defaultValue !== undefined ? { defaultValue } : {}) };
  }

  return null;
}

function walk(sourceFile: ts.SourceFile, extraction: TemplateExtraction) {
  function visit(node: ts.Node) {
    // Any access like settings.foo
    const keyFromAccess = getSettingsKeyFromAccess(node);
    if (keyFromAccess) {
      addKey(extraction, keyFromAccess, `${path.basename(extraction.filePath)}:${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
    }

    // const x = settings.foo || 'default'
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const maybe = extractDefaultsFromInitializer(node.initializer);
      if (maybe) {
        addKey(
          extraction,
          maybe.key,
          `${path.basename(extraction.filePath)}:${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
          maybe.defaultValue
        );
      }
    }

    // const { foo = 'bar', baz = 1 } = settings
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isIdentifier(node.initializer) && node.initializer.text === 'settings') {
      if (ts.isObjectBindingPattern(node.name)) {
        for (const element of node.name.elements) {
          if (!ts.isBindingElement(element)) continue;
          const propertyName = element.propertyName;
          const nameNode = element.name;

          let key: string | null = null;
          if (propertyName && ts.isIdentifier(propertyName)) key = propertyName.text;
          else if (!propertyName && ts.isIdentifier(nameNode)) key = nameNode.text;

          if (!key) continue;
          const defaultValue = element.initializer ? getLiteralValue(element.initializer) : undefined;
          addKey(
            extraction,
            key,
            `${path.basename(extraction.filePath)}:${sourceFile.getLineAndCharacterOfPosition(element.getStart()).line + 1}`,
            defaultValue
          );
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

async function main() {
  const entries = await fs.readdir(TEMPLATE_DIR, { withFileTypes: true });
  const templateFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith('.tsx'))
    .map((e) => path.join(TEMPLATE_DIR, e.name));

  const extractions: TemplateExtraction[] = [];

  for (const filePath of templateFiles) {
    const templateId = path.basename(filePath, '.tsx');
    const src = await fs.readFile(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    const extraction: TemplateExtraction = {
      templateId,
      filePath,
      fields: {},
    };

    walk(sourceFile, extraction);

    // Keep only settings keys that look like actual template settings
    // (avoid noise from local variables named settings in future)
    const keys = Object.keys(extraction.fields);
    if (keys.length > 0) extractions.push(extraction);
  }

  extractions.sort((a, b) => a.templateId.localeCompare(b.templateId));

  const defaultsByTemplate: Record<string, Record<string, unknown>> = {};
  const fieldsByTemplate: Record<string, Array<Omit<InferredField, 'sources'>>> = {};

  for (const ex of extractions) {
    const fields = Object.values(ex.fields).sort((a, b) => a.key.localeCompare(b.key));

    const defaults: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
    }

    defaultsByTemplate[ex.templateId] = defaults;
    fieldsByTemplate[ex.templateId] = fields.map(({ sources: _sources, ...rest }) => rest);
  }

  const content = `/* AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
 * Generated by scripts/extract-template-settings.ts
 */

export type InferredFieldType = ${stableStringify(['text','textarea','number','checkbox','color','image','url','json']).replace('[', '').replace(']', '').replace(/"/g, "'").replace(/,\n\s*/g, ' | ')};

export type InferredField = {
  key: string;
  label: string;
  type: InferredFieldType;
  defaultValue?: unknown;
};

export const GENERATED_TEMPLATE_DEFAULTS: Record<string, Record<string, unknown>> = ${stableStringify(defaultsByTemplate)};

export const GENERATED_TEMPLATE_FIELDS: Record<string, InferredField[]> = ${stableStringify(fieldsByTemplate)};
`;

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, content, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(WORKSPACE_ROOT, OUT_FILE)} for ${extractions.length} templates.`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
