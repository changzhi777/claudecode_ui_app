#!/usr/bin/env node
/**
 * 生成简单的 macOS 应用图标
 */

const fs = require('fs');
const path = require('path');

// 创建一个简单的 SVG 图标
const svgIcon = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#c96442;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b4332;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="1024" height="1024" rx="200" fill="url(#grad1)"/>
  
  <!-- 代码符号 -->
  <g transform="translate(512, 512)">
    <path d="M-150,-100 L-50,0 L-150,100 M50,-100 L150,0 L50,100" 
          stroke="white" stroke-width="60" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="180" stroke="white" stroke-width="40" fill="none" opacity="0.3"/>
  </g>
  
  <!-- UI 装饰 -->
  <rect x="100" y="100" width="824" height="824" rx="150" 
        stroke="white" stroke-width="40" fill="none" opacity="0.2"/>
</svg>
`;

// 保存 SVG
const svgPath = path.join(__dirname, 'icon.svg');
fs.writeFileSync(svgPath, svgIcon);

console.log('✅ SVG 图标已生成：build/icon.svg');
console.log('');
console.log('📝 注意：');
console.log('1. 这是一个简单的占位图标');
console.log('2. 如需自定义图标，请替换 build/icon.svg');
console.log('3. 或者将 .icns 文件放到 build/icon.icns');
