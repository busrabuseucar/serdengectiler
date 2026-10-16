import { mkdir, rm, copyFile } from 'node:fs/promises';
// Publish only runtime assets, never repository docs, tests or local files.
await rm('dist', { recursive: true, force: true });
await mkdir('dist/styles', { recursive: true });
for (const file of ['index.html', 'app.js', 'styles/tailwind.css', 'styles/custom.css']) {
  await copyFile(file, `dist/${file}`);
}
console.log('Static release assembled from four explicit runtime assets.');
