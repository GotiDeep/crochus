const fs = require('fs');
const path = require('path');

function splitComponent(filePath, baseName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);

  // Match template: `...`
  const tmplRegex = /template:\s*`([\s\S]*?)`,\s*(styles:\s*\[`([\s\S]*?)`\]|styles:\s*\[\s*\])/;
  const match = content.match(tmplRegex);

  if (!match) {
    console.log('Skipping (no match):', filePath);
    return false;
  }

  const template = match[1].trim();
  const styles = match[3] ? match[3].trim() : '';

  const htmlPath = path.join(dir, `${baseName}.html`);
  const scssPath = path.join(dir, `${baseName}.scss`);
  const tsPath = path.join(dir, `${baseName}.ts`);

  fs.writeFileSync(htmlPath, template + '\n');
  fs.writeFileSync(scssPath, styles + '\n');

  let updatedTs = content.replace(
    tmplRegex,
    `templateUrl: './${baseName}.html',\n  styleUrl: './${baseName}.scss'`
  );

  fs.writeFileSync(tsPath, updatedTs);
  console.log(`Split successfully: ${filePath} -> ${baseName}.{html,scss,ts}`);
  return true;
}

module.exports = { splitComponent };
