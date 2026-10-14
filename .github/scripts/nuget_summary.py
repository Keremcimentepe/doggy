"""Read `dotnet list package --format json` from stdin and annotate resolved versions."""

import json
import sys


def main() -> int:
    data = json.load(sys.stdin)
    seen: dict[str, str] = {}
    for project in data.get("projects", []):
        for framework in project.get("frameworks", []):
            for package in framework.get("topLevelPackages", []):
                seen[package["id"]] = package.get("resolvedVersion", "?")
    summary = ", ".join(f"{name} {version}" for name, version in sorted(seen.items()))
    print(f"::notice title=NuGet resolved::{summary or 'no packages'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
