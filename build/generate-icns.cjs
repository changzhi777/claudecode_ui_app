const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const svg2img = require('svg2img');

const buildDir = __dirname;
const svgPath = path.join(buildDir, 'icon.svg');
const iconsetDir = path.join(buildDir, 'icon.iconset');
const icnsPath = path.join(buildDir, 'icon.icns');

// 需要生成的尺寸
const sizes = [16, 32, 128, 256, 512];

async function generatePNG(size, isRetina = false) {
  const actualSize = isRetina ? size * 2 : size;
  const filename = isRetina 
    ? `icon_${size}x${size}@2x.png`
    : `icon_${size}x${size}.png`;
  const outputPath = path.join(iconsetDir, filename);

  console.log(`  生成 ${filename} (${actualSize}x${actualSize})`);

  return new Promise((resolve, reject) => {
    svg2img(svgPath, { width: actualSize, height: actualSize }, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        fs.writeFileSync(outputPath, buffer);
        resolve();
      }
    });
  });
}

async function generateICNS() {
  console.log('🎨 开始生成 Claude 图标 ICNS...\n');

  // 清理旧文件
  if (fs.existsSync(iconsetDir)) {
    fs.rmSync(iconsetDir, { recursive: true });
  }
  if (fs.existsSync(icnsPath)) {
    fs.unlinkSync(icnsPath);
  }

  // 创建 iconset 目录
  fs.mkdirSync(iconsetDir, { recursive: true });

  // 生成所有尺寸的 PNG
  console.log('📐 生成不同尺寸的 PNG...');
  for (const size of sizes) {
    await generatePNG(size, false);
    await generatePNG(size, true);
  }

  // 转换为 ICNS
  console.log('\n🔄 转换为 ICNS 格式...');
  try {
    execSync(`iconutil -c icns ${iconsetDir} -o ${icnsPath}`, { cwd: buildDir });
    console.log('✅ ICNS 生成完成\n');

    // 显示文件信息
    const stats = fs.statSync(icnsPath);
    console.log('📊 文件信息:');
    console.log(`   路径: ${icnsPath}`);
    console.log(`   大小: ${(stats.size / 1024).toFixed(2)} KB`);

    // 清理临时文件
    fs.rmSync(iconsetDir, { recursive: true });
    console.log('\n✅ 临时文件已清理');
  } catch (error) {
    console.error('❌ ICNS 生成失败:', error.message);
    throw error;
  }
}

generateICNS().catch(console.error);
