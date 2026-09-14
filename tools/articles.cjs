const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const Ajv = require('ajv');

const ROOT = path.resolve(__dirname, '..');
const START = '<!-- articles:start -->';
const END = '<!-- articles:end -->';

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function validator(schema) {
  const ajv = new Ajv({ allErrors: true });
  ajv.addFormat('date', validDate);
  return ajv.compile(schema);
}

function readArticle(file, source, validate, legacyPaths) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter`);
  const metadata = YAML.parse(match[1]);
  if (!validate(metadata)) throw new Error(`${file}: ${JSON.stringify(validate.errors)}`);
  const name = path.posix.basename(file);
  const dated = name.match(/^(\d{4}-\d{2}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/);
  if (!legacyPaths.includes(file) && !dated) {
    throw new Error(`${file}: new articles must use YYYY-MM-DD-slug.md`);
  }
  if (dated && dated[1] !== metadata.date) {
    throw new Error(`${file}: filename date must match frontmatter date`);
  }
  return { ...metadata, file };
}

function groups(articles) {
  const months = new Map();
  for (const article of [...articles].sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file))) {
    const month = article.date.slice(0, 7);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push(article);
  }
  return months;
}

function monthLabel(month) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function navigation(articles, compatibilityPages) {
  const visible = articles.filter(a => !Object.hasOwn(compatibilityPages, a.file)).map(a => ({
    ...a,
    title: a.title.replace(/\s+/g, ' ').trim(),
    description: a.description.replace(/\s+/g, ' ').trim(),
  }));
  const toc = [{ file: 'content/index.md' }];
  const lines = [START, ''];
  for (const [month, entries] of groups(visible)) {
    lines.push(`## ${monthLabel(month)}`, '');
    toc.push({ title: monthLabel(month), children: entries.map(a => ({ file: a.file, title: `${a.date.slice(5)} · ${a.title}` })) });
    for (const a of entries) {
      const title = a.title.replace(/([\\\[\]])/g, '\\$1');
      lines.push(`- **${a.date}** — [${title}](${path.posix.basename(a.file)})`, `  ${a.description}`, '');
    }
  }
  for (const file of Object.keys(compatibilityPages).sort()) toc.push({ file, hidden: true });
  lines.push(END);
  return { toc, index: lines.join('\n') };
}

function replaceIndex(source, generated) {
  const start = source.indexOf(START);
  const end = source.indexOf(END);
  if (start < 0 || end < start) throw new Error('content/index.md: missing article list markers');
  return source.slice(0, start) + generated + source.slice(end + END.length);
}

function run(root, sync) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'schema/articles.json'), 'utf8'));
  const validate = validator(JSON.parse(fs.readFileSync(path.join(root, 'schema/article.schema.json'), 'utf8')));
  const files = fs.readdirSync(path.join(root, 'content')).filter(f => f.endsWith('.md') && f !== 'index.md').sort();
  const articles = files.map(f => {
    const file = `content/${f}`;
    return readArticle(file, fs.readFileSync(path.join(root, file), 'utf8'), validate, config.legacyPaths);
  });
  for (const [file, target] of Object.entries(config.compatibilityPages)) {
    if (!articles.some(a => a.file === file) || !articles.some(a => a.file === target.split('#')[0])) {
      throw new Error(`Invalid compatibility mapping: ${file} -> ${target}`);
    }
  }
  const generated = navigation(articles, config.compatibilityPages);
  const indexPath = path.join(root, 'content/index.md');
  const index = fs.readFileSync(indexPath, 'utf8');
  const expectedIndex = replaceIndex(index, generated.index);
  const mystPath = path.join(root, 'myst.yml');
  const myst = YAML.parseDocument(fs.readFileSync(mystPath, 'utf8'));
  const currentToc = myst.getIn(['project', 'toc']).toJSON();
  const stale = index !== expectedIndex || JSON.stringify(currentToc) !== JSON.stringify(generated.toc);
  if (sync) {
    fs.writeFileSync(indexPath, expectedIndex);
    myst.setIn(['project', 'toc'], generated.toc);
    fs.writeFileSync(mystPath, myst.toString({ lineWidth: 0 }));
  } else if (stale) {
    throw new Error('Article navigation is stale. Run npm run articles:sync and commit content/index.md and myst.yml.');
  }
  console.log(`${sync ? 'Synced' : 'Checked'} ${articles.length} article records; ${Object.keys(config.compatibilityPages).length} compatibility pages hidden from navigation.`);
}

if (require.main === module) {
  try { run(ROOT, process.argv.includes('--write')); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { validDate, validator, readArticle, navigation, replaceIndex, run };
