import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  cwd: root,
  env: { ...process.env, SOORA_OUTPUT: 'server' },
  stdio: 'inherit',
});
if (result.error) {
  console.error(result.error.message);
}
process.exit(result.status ?? 1);
