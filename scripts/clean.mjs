import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await fs.rm(path.join(projectRoot, 'dist'), {recursive: true, force: true});
await fs.rm(path.join(projectRoot, '.test-dist'), {recursive: true, force: true});
