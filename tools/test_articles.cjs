const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const YAML = require('yaml');
const { validDate, validator, readArticle, navigation, run } = require('./articles.cjs');
const schema = require('../schema/article.schema.json');
const validate = validator(schema);
const source = (date = '2026-09-13') => `---\ntitle: "A title: with punctuation"\ndescription: A useful explanation.\ndate: ${date}\n---\n\nBody.\n`;

test('creation dates must be real calendar dates', () => {
  for (const value of ['2026-02-29', '2026-13-01', '2026-09-31', '09-13-2026']) assert.equal(validDate(value), false);
  assert.equal(validDate('2024-02-29'), true);
});

test('new filenames need a date matching the required metadata', () => {
  assert.throws(() => readArticle('content/new.md', source(), validate, []), /YYYY-MM-DD/);
  assert.throws(() => readArticle('content/2026-09-12-new.md', source(), validate, []), /must match/);
  assert.throws(() => readArticle('content/2026-09-13-new.md', source().replace('date: 2026-09-13\n', ''), validate, []), /required/);
  assert.equal(readArticle('content/2026-09-13-new.md', source(), validate, []).date, '2026-09-13');
  assert.equal(readArticle('content/old.md', source(), validate, ['content/old.md']).date, '2026-09-13');
});

test('navigation sorts by date, groups months, and keeps compatibility routes hidden', () => {
  const articles = [
    { file: 'content/older.md', title: 'Older', date: '2026-08-31', description: 'Old note.' },
    { file: 'content/stub.md', title: 'Stub', date: '2026-09-14', description: 'Moved.' },
    { file: 'content/newer.md', title: 'Newer', date: '2026-09-13', description: 'New note.' },
  ];
  const output = navigation(articles, { 'content/stub.md': 'content/newer.md#reference' });
  assert.equal(output.toc[1].title, 'September 2026');
  assert.equal(output.toc[2].title, 'August 2026');
  assert.equal(output.toc[1].children[0].title, '09-13 · Newer');
  assert.deepEqual(output.toc.at(-1), { file: 'content/stub.md', hidden: true });
  assert.ok(output.index.indexOf('newer.md') < output.index.indexOf('older.md'));
  assert.ok(!output.index.includes('stub.md'));
});

test('sync repairs stale navigation, preserves other config, and check detects subsequent drift', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'notebook-articles-'));
  try {
    fs.mkdirSync(path.join(root, 'schema'));
    fs.mkdirSync(path.join(root, 'content'));
    fs.writeFileSync(path.join(root, 'schema/article.schema.json'), JSON.stringify(schema));
    fs.writeFileSync(path.join(root, 'schema/articles.json'), JSON.stringify({ legacyPaths: [], compatibilityPages: {} }));
    fs.writeFileSync(path.join(root, 'content/2026-09-13-new.md'), source());
    fs.writeFileSync(path.join(root, 'content/index.md'), 'Intro\n<!-- articles:start -->\n<!-- articles:end -->\nFooter\n');
    fs.writeFileSync(path.join(root, 'myst.yml'), 'version: 1\nproject:\n  title: Keep this\n  toc: []\nsite:\n  template: book-theme\n');
    assert.throws(() => run(root, false), /stale/);
    run(root, true);
    run(root, false);
    const config = YAML.parse(fs.readFileSync(path.join(root, 'myst.yml'), 'utf8'));
    assert.equal(config.project.title, 'Keep this');
    assert.equal(config.site.template, 'book-theme');
    assert.match(fs.readFileSync(path.join(root, 'content/index.md'), 'utf8'), /Footer\n$/);
    fs.writeFileSync(path.join(root, 'content/2026-09-13-new.md'), source().replace('A useful explanation.', 'An updated explanation.'));
    assert.throws(() => run(root, false), /stale/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('multiline YAML metadata stays in one navigation entry', () => {
  const output = navigation([{ file: 'content/new.md', title: 'A\nlong title', description: 'First line.\nSecond line.', date: '2026-09-13' }], {});
  assert.match(output.index, /\[A long title\]/);
  assert.match(output.index, /  First line\. Second line\.\n/);
  assert.equal(output.toc[1].children[0].title, '09-13 · A long title');
});
