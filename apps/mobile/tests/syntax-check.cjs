// Run with a real installed TypeScript module path when Expo dependencies are unavailable:
// node tests/syntax-check.cjs ../web/node_modules/typescript
const fs = require('node:fs');
const path = require('node:path');
const ts = require(path.resolve(process.argv[2] || 'node_modules/typescript'));
const root = path.resolve(__dirname, '..');
const files = [path.join(root, 'App.tsx'), path.join(root, 'LegacyMarketplace.tsx'), ...fs.readdirSync(path.join(root, 'src')).filter(f => /\.tsx?$/.test(f) && !f.endsWith('.d.ts')).map(f => path.join(root, 'src', f))];
let errors = 0;
for (const filename of files) {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { fileName: filename, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, isolatedModules: true } });
  for (const diagnostic of result.diagnostics ?? []) {
    if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
    errors++;
    process.stderr.write(`${path.relative(root, filename)}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}\n`);
  }
}
process.stdout.write(`Native TypeScript syntax: ${files.length} files checked, ${errors} errors. Full native type checking requires installed Expo dependencies.\n`);
process.exitCode = errors ? 1 : 0;
