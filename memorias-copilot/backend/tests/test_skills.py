import json
import pytest
from pathlib import Path

import sync_skills
from copilot.llm import _load_system_prompt, _load_skills_config


def test_system_prompt_loading_has_no_rule6_or_rule9():
    prompt = _load_system_prompt()
    assert prompt is not None
    assert "STUDENT ORIENTATION MODE" not in prompt
    assert "MANDATORY `get_tag_cloud` CALL FOR UNRELATED TOPICS" not in prompt


def test_skills_config_loader():
    skills = _load_skills_config()
    assert isinstance(skills, list)


def test_zip_skill(tmp_path, monkeypatch):
    skills_dir = tmp_path / "skills"
    test_skill = skills_dir / "test-skill"
    test_skill.mkdir(parents=True)
    (test_skill / "SKILL.md").write_text("--- name: test ---\nHello", encoding="utf-8")

    monkeypatch.setattr(sync_skills, "SKILLS_DIR", skills_dir)
    monkeypatch.setattr(sync_skills, "BASE_DIR", tmp_path)

    zip_file = sync_skills.zip_skill("test-skill")
    assert zip_file.exists()
    assert zip_file.name == "test-skill.zip"


class DummySkillsAPI:
    def create(self, file, name):
        class Resp:
            id = f"skill_mock_{name}"
        return Resp()

    def retrieve(self, skill_id):
        if skill_id.startswith("skill_mock_"):
            return {"id": skill_id, "status": "active"}
        raise ValueError("Invalid skill_id")


class DummyOpenAIClient:
    def __init__(self):
        self.skills = DummySkillsAPI()


def test_deploy_and_verify_skills(tmp_path, monkeypatch):
    skills_dir = tmp_path / "skills"
    test_skill = skills_dir / "student-orientation"
    test_skill.mkdir(parents=True)
    (test_skill / "SKILL.md").write_text("--- name: student-orientation ---\nContent", encoding="utf-8")

    lockfile = tmp_path / "skills.json"

    monkeypatch.setattr(sync_skills, "SKILLS_DIR", skills_dir)
    monkeypatch.setattr(sync_skills, "BASE_DIR", tmp_path)
    monkeypatch.setattr(sync_skills, "LOCKFILE_PATH", lockfile)

    client = DummyOpenAIClient()
    skill_id = sync_skills.deploy_skill("student-orientation", client=client)
    assert skill_id == "skill_mock_student-orientation"
    assert lockfile.exists()

    lock_data = json.loads(lockfile.read_text(encoding="utf-8"))
    assert lock_data.get("student-orientation") == "skill_mock_student-orientation"

    verified = sync_skills.verify_skills(client=client)
    assert verified is True
