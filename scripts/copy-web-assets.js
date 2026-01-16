const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../dist/renderer');
const targetDir = path.join(__dirname, '../dist-web');

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 复制 index.html
const sourceHtml = path.join(sourceDir, 'index.html');
const targetHtml = path.join(targetDir, 'index.html');
if (fs.existsSync(sourceHtml)) {
  fs.copyFileSync(sourceHtml, targetHtml);
  console.log('✓ Copied index.html');
}

// 复制 assets 目录
const sourceAssets = path.join(sourceDir, 'assets');
const targetAssets = path.join(targetDir, 'assets');
if (fs.existsSync(sourceAssets)) {
  if (!fs.existsSync(targetAssets)) {
    fs.mkdirSync(targetAssets, { recursive: true });
  }
  const files = fs.readdirSync(sourceAssets);
  files.forEach(file => {
    fs.copyFileSync(
      path.join(sourceAssets, file),
      path.join(targetAssets, file)
    );
  });
  console.log(`✓ Copied ${files.length} asset files`);
}

console.log('\n✓ Web build ready in dist-web/');
console.log('  You can deploy this directory to any static hosting service.');
