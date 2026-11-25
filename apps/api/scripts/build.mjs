import { stripTypeScriptTypes } from 'node:module';
import { mkdir,readFile,writeFile,readdir } from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const name of await readdir('src')) {
  if(!name.endsWith('.ts'))continue;
  const source=await readFile(`src/${name}`,'utf8');
  const js=stripTypeScriptTypes(source,{mode:'transform',sourceMap:false}).replace(/(from\s+['"]\.\/.+?)\.ts(['"])/g,'$1.js$2');
  await writeFile(`dist/${name.replace(/\.ts$/,'.js')}`,js);
}
console.log('API runtime build completed. PostgreSQL repository is not mounted and requires database integration tests.');
