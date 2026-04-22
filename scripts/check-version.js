#!/usr/bin/env node

/**
 * Node.js版本检查脚本
 *
 * 在安装依赖前检查Node.js版本是否满足要求
 */

const requiredMajor = 18;
const requiredMinor = 0;

const currentVersion = process.version;
const [_, major, minor] = currentVersion.split('.').map(Number);

console.log(`\n🔍 检查 Node.js 版本...\n`);
console.log(`当前版本: ${currentVersion}`);
console.log(`要求版本: >= ${requiredMajor}.${requiredMinor}.0.0\n`);

if (major < requiredMajor || (major === requiredMajor && minor < requiredMinor)) {
  console.error(`❌ Node.js 版本过低！`);
  console.error(`   当前版本: ${currentVersion}`);
  console.error(`   要求版本: >= ${requiredMajor}.${requiredMinor}.0.0`);
  console.error(`\n请升级 Node.js 后重新安装依赖。\n`);
  console.error(`下载地址: https://nodejs.org/\n`);
  process.exit(1);
}

console.log(`✅ Node.js 版本检查通过！\n`);
