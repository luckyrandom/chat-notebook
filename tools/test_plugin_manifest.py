import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MARKETPLACE_PATH = ROOT / ".agents" / "plugins" / "marketplace.json"
PLUGIN_ROOT = ROOT / "plugins" / "chat-notebook"
MANIFEST_PATH = PLUGIN_ROOT / ".codex-plugin" / "plugin.json"


class PluginManifestTests(unittest.TestCase):
    def test_marketplace_points_to_chat_notebook_plugin(self):
        marketplace = json.loads(MARKETPLACE_PATH.read_text())
        self.assertEqual(marketplace["name"], "chat-notebook")
        self.assertEqual(marketplace["interface"]["displayName"], "Chat Notebook")

        entries = marketplace["plugins"]
        self.assertEqual(len(entries), 1)
        entry = entries[0]
        self.assertEqual(entry["name"], "chat-notebook")
        self.assertEqual(entry["source"], {
            "source": "local",
            "path": "./plugins/chat-notebook",
        })
        self.assertEqual(entry["policy"]["installation"], "AVAILABLE")
        self.assertEqual(entry["policy"]["authentication"], "ON_USE")
        self.assertEqual(entry["category"], "Productivity")

    def test_manifest_is_skill_only(self):
        manifest = json.loads(MANIFEST_PATH.read_text())
        self.assertEqual(manifest["name"], "chat-notebook")
        self.assertRegex(manifest["version"], r"^\d+\.\d+\.\d+$")
        self.assertEqual(manifest["skills"], "./skills/")
        self.assertNotIn("mcpServers", manifest)
        self.assertNotIn("apps", manifest)
        self.assertFalse((PLUGIN_ROOT / ".mcp.json").exists())
        self.assertFalse((PLUGIN_ROOT / ".app.json").exists())

        interface = manifest["interface"]
        for key in (
            "displayName",
            "shortDescription",
            "longDescription",
            "developerName",
            "category",
            "capabilities",
            "websiteURL",
            "defaultPrompt",
        ):
            self.assertTrue(interface[key])
        self.assertLessEqual(len(interface["defaultPrompt"]), 3)
        for prompt in interface["defaultPrompt"]:
            self.assertLessEqual(len(prompt), 128)

    def test_expected_skills_have_frontmatter(self):
        expected = {
            "note-taking",
            "technical-writing",
            "chat-notebook-publisher",
        }
        skills_root = PLUGIN_ROOT / "skills"
        actual = {path.name for path in skills_root.iterdir() if path.is_dir()}
        self.assertEqual(actual, expected)

        for name in expected:
            text = (skills_root / name / "SKILL.md").read_text()
            self.assertTrue(text.startswith("---\n"), name)
            self.assertRegex(text, rf"(?m)^name: {re.escape(name)}$")
            self.assertRegex(text, r"(?m)^description: \S.+$")

    def test_publisher_defers_to_canonical_repository_skill(self):
        text = (PLUGIN_ROOT / "skills" / "chat-notebook-publisher" / "SKILL.md").read_text()
        self.assertIn(".chatgpt/skills/chat-notebook-publisher/SKILL.md", text)
        self.assertIn("current `main` branch", text)


if __name__ == "__main__":
    unittest.main()
