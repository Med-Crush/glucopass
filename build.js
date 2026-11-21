// Bundles src/*.jsx into a single self-contained index.html (JSX precompiled, no runtime Babel).
// Usage: node build.js
const fs = require('fs');
const path = require('path');
const Babel = require('@babel/standalone');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.jsx')).sort();
const source = files.map((f) => `/* ---- ${f} ---- */\n` + fs.readFileSync(path.join(srcDir, f), 'utf8')).join('\n');

const { code } = Babel.transform(source, { presets: [['react', { runtime: 'classic' }]], filename: 'app.jsx', compact: false });
const template = fs.readFileSync(path.join(srcDir, 'template.html'), 'utf8');
const html = template.replace('/*APP*/', () => '(function(){\n' + code + '\n})();');
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log(`Built index.html from ${files.length} files (${(html.length / 1024).toFixed(0)} KB)`);
