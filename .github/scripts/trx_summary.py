"""Turn xUnit TRX results into GitHub annotations (counts + first failures).

Annotations are visible on the run page and through the checks API, so test
results can be read without downloading the full job log.
"""

import glob
import sys
import xml.etree.ElementTree as ET

NS = {"t": "http://microsoft.com/schemas/VisualStudio/TeamTest/2010"}


def escape(text: str) -> str:
    return text.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")


def main() -> int:
    root = sys.argv[1] if len(sys.argv) > 1 else "TestResults"
    files = glob.glob(f"{root}/**/*.trx", recursive=True)
    if not files:
        print("::warning title=xUnit::No TRX result files found")
        return 0

    total = passed = failed = skipped = 0
    failures: list[str] = []
    for path in files:
        doc = ET.parse(path).getroot()
        counters = doc.find("t:ResultSummary/t:Counters", NS)
        if counters is not None:
            total += int(counters.get("total", 0))
            passed += int(counters.get("passed", 0))
            failed += int(counters.get("failed", 0))
            skipped += int(counters.get("notExecuted", 0))
        for result in doc.iterfind("t:Results/t:UnitTestResult", NS):
            if result.get("outcome") != "Failed":
                continue
            message = result.findtext("t:Output/t:ErrorInfo/t:Message", default="", namespaces=NS)
            failures.append(f"{result.get('testName')}\n{message.strip()[:1500]}")

    level = "error" if failed else "notice"
    print(f"::{level} title=xUnit::total={total} passed={passed} failed={failed} skipped={skipped}")
    for failure in failures[:5]:
        print(f"::error title=xUnit failure::{escape(failure)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
