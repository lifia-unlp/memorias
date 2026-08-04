import argparse
import json
import os
import sys
import zipfile
from pathlib import Path
from typing import Dict, Any

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None  # type: ignore

BASE_DIR = Path(__file__).resolve().parent
SKILLS_DIR = BASE_DIR / "src" / "copilot" / "skills"
LOCKFILE_PATH = BASE_DIR / "src" / "copilot" / "config" / "skills.json"


def load_lockfile() -> Dict[str, str]:
    if not LOCKFILE_PATH.exists():
        return {}
    with open(LOCKFILE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_lockfile(data: Dict[str, str]) -> None:
    LOCKFILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LOCKFILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def zip_skill(skill_name: str) -> Path:
    skill_path = SKILLS_DIR / skill_name
    if not skill_path.exists() or not skill_path.is_dir():
        raise FileNotFoundError(f"Skill directory not found: {skill_path}")
    
    zip_path = BASE_DIR / f"{skill_name}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(skill_path):
            for file in files:
                file_p = Path(root) / file
                arcname = file_p.relative_to(skill_path)
                zipf.write(file_p, arcname)
    return zip_path


def get_openai_client() -> Any:
    if OpenAI is None:
        raise RuntimeError("The 'openai' package is not installed. Please install it to use sync_skills.")
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set.")
    return OpenAI(api_key=api_key)


def deploy_skill(skill_name: str, client: Any = None) -> str:
    zip_path = zip_skill(skill_name)
    try:
        if client is None:
            client = get_openai_client()
        
        # Deploy using OpenAI Skills API
        with open(zip_path, "rb") as f:
            # Assuming client.skills.create API interface
            response = client.skills.create(file=f, name=skill_name)
            if hasattr(response, "id"):
                skill_id = response.id
            elif isinstance(response, dict):
                skill_id = response["id"]
            else:
                skill_id = str(response)
        
        lock = load_lockfile()
        lock[skill_name] = skill_id
        save_lockfile(lock)
        print(f"Successfully deployed skill '{skill_name}' -> ID: {skill_id}")
        return skill_id
    finally:
        if zip_path.exists():
            zip_path.unlink()


def deploy_all(client: Any = None) -> None:
    if not SKILLS_DIR.exists():
        print("No skills directory found.")
        return
    for item in SKILLS_DIR.iterdir():
        if item.is_dir() and (item / "SKILL.md").exists():
            deploy_skill(item.name, client=client)


def verify_skills(client: Any = None) -> bool:
    lock = load_lockfile()
    if not lock:
        print("skills.json is empty or missing.")
        return True
    
    if client is None:
        client = get_openai_client()
    
    all_valid = True
    for skill_name, skill_id in lock.items():
        if not skill_id:
            print(f"[-] Skill '{skill_name}' has no assigned skill_id in skills.json.")
            all_valid = False
            continue
        try:
            # Verify retrieving skill from OpenAI API
            res = client.skills.retrieve(skill_id)
            print(f"[+] Skill '{skill_name}' ({skill_id}) verified.")
        except Exception as e:
            print(f"[-] Failed to verify skill '{skill_name}' ({skill_id}): {e}")
            all_valid = False
    return all_valid


def main():
    parser = argparse.ArgumentParser(description="Memorias Copilot Agent Skills Sync Utility")
    subparsers = parser.add_subparsers(dest="command", required=True)

    deploy_parser = subparsers.add_parser("deploy", help="Deploy a single skill to OpenAI")
    deploy_parser.add_argument("skill_name", help="Name of the skill directory under src/copilot/skills/")

    subparsers.add_parser("deploy-all", help="Deploy all skills in src/copilot/skills/ to OpenAI")
    subparsers.add_parser("verify", help="Verify all skill IDs in skills.json against OpenAI API")

    args = parser.parse_args()

    if args.command == "deploy":
        deploy_skill(args.skill_name)
    elif args.command == "deploy-all":
        deploy_all()
    elif args.command == "verify":
        valid = verify_skills()
        sys.exit(0 if valid else 1)


if __name__ == "__main__":
    main()
