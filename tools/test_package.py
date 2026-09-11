import tempfile
import unittest
import zipfile
from pathlib import Path
from package import package, verify, MANIFEST


class PackagingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.site = self.root / '_build/html'
        self.site.mkdir(parents=True)
        (self.site / 'index.html').write_text('<h1>Approved wording</h1>')

    def test_round_trip_deterministic_and_content_sensitive(self):
        first = package(self.root, 'site')
        original = first.read_bytes()
        self.assertEqual(first, package(self.root, 'site'))
        self.assertEqual(original, first.read_bytes())
        self.assertIn(verify(first), first.name)
        (self.site / 'index.html').write_text('<h1>Changed wording</h1>')
        self.assertNotEqual(first, package(self.root, 'site'))

    def test_tampered_content_rejected(self):
        first = package(self.root, 'site')
        with zipfile.ZipFile(first) as z:
            manifest = z.read(MANIFEST)
        bad = self.root / 'bad.zip'
        with zipfile.ZipFile(bad, 'w') as z:
            z.writestr(MANIFEST, manifest)
            z.writestr('index.html', 'changed')
        with self.assertRaisesRegex(ValueError, 'Hash mismatch'):
            verify(bad)

    def test_symlink_rejected(self):
        (self.root / 'secret').write_text('not part of the site')
        (self.site / 'leak').symlink_to(self.root / 'secret')
        with self.assertRaisesRegex(ValueError, 'Symlinks'):
            package(self.root, 'site')

    def test_unlisted_file_rejected(self):
        first = package(self.root, 'site')
        with zipfile.ZipFile(first, 'a') as z:
            z.writestr('unexpected.js', 'alert(1)')
        with self.assertRaisesRegex(ValueError, 'contents differ'):
            verify(first)

    def test_path_traversal_rejected(self):
        bad = self.root / 'bad.zip'
        with zipfile.ZipFile(bad, 'w') as z:
            z.writestr('../escape', '')
        with self.assertRaisesRegex(ValueError, 'unsafe'):
            verify(bad)
