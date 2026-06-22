const fs = require('fs');
const path = require('path');

function updateImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      updateImports(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // replace ../../ with ../../../
      content = content.replace(/\.\.\/\.\.\//g, '../../../');
      fs.writeFileSync(fullPath, content);
    }
  }
}

updateImports(path.join(__dirname, 'src/pages/admin'));
updateImports(path.join(__dirname, 'src/pages/user'));
console.log('Done updating imports');
