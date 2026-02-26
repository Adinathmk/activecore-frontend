const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = 'c:\\Users\\ASUS\\OneDrive\\Desktop\\Active core\\Frontend\\src';

walkDir(targetDir, function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let replaced = content.replace(/['"]@\/features\/auth\/hooks\/AuthContext['"]/g, "'@/features/auth/hooks/useAuth'");
    if (content !== replaced) {
      console.log('Updated: ' + filePath);
      fs.writeFileSync(filePath, replaced, 'utf8');
    }
  }
});
