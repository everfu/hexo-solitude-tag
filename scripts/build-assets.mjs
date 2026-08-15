import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import stylus from 'stylus';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceCss = path.join(projectRoot, 'lib', 'css');
const outputCss = path.join(projectRoot, 'dist', 'css');
const sourceRuntime = path.join(projectRoot, 'lib', 'runtime', 'client.js');
const outputRuntime = path.join(projectRoot, 'dist', 'runtime', 'client.js');

await fs.mkdir(outputCss, {recursive: true});
await fs.mkdir(path.dirname(outputRuntime), {recursive: true});

const entries = await fs.readdir(sourceCss, {withFileTypes: true});
await Promise.all(entries
  .filter(entry => entry.isFile() && entry.name.endsWith('.styl'))
  .map(entry => fs.copyFile(path.join(sourceCss, entry.name), path.join(outputCss, entry.name))));

const css = await new Promise((resolve, reject) => {
  stylus('')
    .set('compress', true)
    .import(path.join(sourceCss, 'index.styl'))
    .render((error, output) => {
      if (error) reject(error);
      else resolve(output);
    });
});

await fs.writeFile(path.join(outputCss, 'index.css'), css);
await fs.copyFile(sourceRuntime, outputRuntime);
