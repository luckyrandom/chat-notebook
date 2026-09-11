"""Portable, dependency-free source and site packaging (Python 3.10+)."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE_TREES = ('content', 'themes', 'tools', 'docs', '.github/workflows')
SOURCE_FILES = ('myst.yml', 'package.json', 'package-lock.json', 'README.md', '.nvmrc', '.gitignore')
MANIFEST = 'notebook-manifest.json'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()


def safe_name(name):
    p = PurePosixPath(name)
    return bool(name) and not p.is_absolute() and '..' not in p.parts and '\\' not in name and str(p) == name


def collect(root, kind):
    root = Path(root)
    base = root if kind == 'source' else root / '_build/html'
    if kind == 'source':
        paths = [root / name for name in SOURCE_FILES]
        for tree in SOURCE_TREES:
            paths.extend((root / tree).rglob('*'))
    else:
        if not (base / 'index.html').is_file():
            raise ValueError('No static index.html. Run npm run build first.')
        paths = list(base.rglob('*'))
    result = {}
    for path in sorted(set(paths)):
        if '__pycache__' in path.parts or path.suffix == '.pyc':
            continue
        if path.is_symlink():
            raise ValueError(f'Symlinks are not supported: {path}')
        if path.is_dir():
            continue
        if not path.is_file():
            raise ValueError(f'Missing required file: {path}')
        name = path.relative_to(base).as_posix()
        if name == MANIFEST or not safe_name(name):
            raise ValueError(f'Reserved or invalid path: {name}')
        result[name] = path.read_bytes()
    if not result:
        raise ValueError('Empty package')
    return result


def package(root, kind):
    payload = collect(root, kind)
    descriptor = {'format': 1, 'kind': kind, 'files': {n: digest(b) for n, b in payload.items()}}
    revision = digest(canonical(descriptor))
    manifest = descriptor | {'revision': revision}
    payload[MANIFEST] = canonical(manifest)
    out = Path(root) / 'dist' / f'{kind}-{revision}.zip'
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for name, data in sorted(payload.items()):
            info = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, data)
    verify(out)
    return out


def verify(path):
    with zipfile.ZipFile(path) as z:
        names = z.namelist()
        if len(names) != len(set(names)) or not all(safe_name(n) for n in names):
            raise ValueError('Duplicate or unsafe archive paths')
        m = json.loads(z.read(MANIFEST))
        if m.get('format') != 1 or m.get('kind') not in ('source', 'site'):
            raise ValueError('Unsupported manifest')
        expected = m['files']
        if set(names) != set(expected) | {MANIFEST}:
            raise ValueError('Archive contents differ from manifest')
        for name, sha in expected.items():
            if digest(z.read(name)) != sha:
                raise ValueError(f'Hash mismatch: {name}')
        descriptor = {k: m[k] for k in ('format', 'kind', 'files')}
        if digest(canonical(descriptor)) != m['revision']:
            raise ValueError('Revision mismatch')
        return m['revision']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['source', 'site', 'verify'])
    parser.add_argument('archive', nargs='?')
    args = parser.parse_args()
    try:
        if args.command == 'verify':
            if not args.archive:
                parser.error('verify requires an archive path')
            print('Verified revision:', verify(args.archive))
        else:
            if args.archive:
                parser.error('archive argument is only valid with verify')
            print(package(ROOT, args.command))
    except (ValueError, OSError, KeyError, zipfile.BadZipFile) as e:
        parser.exit(1, f'Error: {e}\n')


if __name__ == '__main__':
    main()
