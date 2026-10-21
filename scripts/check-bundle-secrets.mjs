import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const assetDirectory = 'dist/assets';
const candidates = (await readdir(assetDirectory)).filter((name) =>
  /\.(?:js|css)$/.test(name),
);

if (candidates.length === 0) {
  console.error('No built JavaScript or CSS assets found. Run npm run build first.');
  process.exit(1);
}

const patterns = [
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{30,}\b/],
  ['GitLab token', /\bglpat-[A-Za-z0-9_-]{20,}\b/],
  ['cloud access key ID', /\bAKIA[0-9A-Z]{16}\b/],
  ['chat API token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
];

const findings = [];
for (const name of candidates) {
  const content = await readFile(join(assetDirectory, name), 'utf8');
  for (const [label, pattern] of patterns) {
    if (pattern.test(content)) findings.push({ name, label });
  }
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(`Possible ${finding.label} found in ${assetDirectory}/${finding.name}`);
  }
  process.exit(1);
}

console.log(`Scanned ${candidates.length} built assets; no common token patterns found.`);
