import { readFile,readdir } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
let count=0;
for(const name of await readdir('src')) {
  if(!name.endsWith('.ts'))continue;
  const code=await readFile(`src/${name}`,'utf8');
  stripTypeScriptTypes(code,{mode:'transform'});
  if(/\beval\s*\(|new Function\s*\(|console\.log\(.*(?:token|secret)/i.test(code))throw new Error(`Unsafe code in ${name}`);
  count++;
}
console.log(`Syntax and unsafe-pattern lint passed for ${count} TypeScript modules.`);
