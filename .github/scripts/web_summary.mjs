// Turn Vitest JSON results and installed package versions into GitHub annotations.
// Run from the web/ directory.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const escape = (text) => text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

if (existsSync('vitest-results.json')) {
  const results = JSON.parse(readFileSync('vitest-results.json', 'utf8'));
  const level = results.numFailedTests > 0 ? 'error' : 'notice';
  console.log(
    `::${level} title=Vitest::total=${results.numTotalTests} passed=${results.numPassedTests} ` +
      `failed=${results.numFailedTests} skipped=${results.numPendingTests}`,
  );
  const failures = results.testResults
    .flatMap((file) => file.assertionResults ?? [])
    .filter((test) => test.status === 'failed')
    .slice(0, 5);
  for (const test of failures) {
    const message = (test.failureMessages ?? []).join('\n').slice(0, 1500);
    console.log(`::error title=Vitest failure::${escape(`${test.fullName}\n${message}`)}`);
  }
} else {
  console.log('::warning title=Vitest::vitest-results.json not found');
}

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const names = [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})];
const versions = names
  .map((name) => {
    const path = `node_modules/${name}/package.json`;
    return `${name} ${existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).version : 'missing'}`;
  })
  .join(', ');
console.log(`::notice title=npm resolved::${versions}`);
// npm install creates a lockfile in CI, so ask git whether one is actually committed.
let lockCommitted = true;
try {
  execSync('git ls-files --error-unmatch package-lock.json', { stdio: 'ignore' });
} catch {
  lockCommitted = false;
}
console.log(`::notice title=npm lockfile::${lockCommitted ? 'committed' : 'not committed'}`);
