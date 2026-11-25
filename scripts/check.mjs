import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "../apps/web/node_modules/typescript/lib/typescript.js";
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const files = fs
  .readdirSync("apps/web/src")
  .filter((f) => /\.(tsx?|mjs)$/.test(f));
let errors = 0;
for (const file of files) {
  const source = fs.readFileSync(path.join("apps/web/src", file), "utf8");
  const parsed = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  for (const d of parsed.parseDiagnostics) {
    console.error(
      `${file}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
    );
    errors++;
  }
  for (const [label, re] of [
    ["unsafe HTML", /dangerouslySetInnerHTML/],
    ["dynamic evaluation", /\beval\s*\(/],
    ["embedded private key", /-----BEGIN (RSA )?PRIVATE KEY/],
    ["real gateway secret", /rzp_live_[A-Za-z0-9]{12,}/],
  ])
    if (re.test(source)) {
      console.error(`${file}: ${label}`);
      errors++;
    }
}
console.log(
  `Web source lint: ${files.length} files; ${errors} syntax or safety errors.`,
);
process.exitCode = errors ? 1 : 0;
