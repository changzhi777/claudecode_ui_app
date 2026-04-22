# 安全检查清单

**版本**：v0.5.0
**更新日期**：2026-04-22
**检查人**：BB小子 🤙

---

## 📋 目录

1. [代码安全](#代码安全)
2. [依赖安全](#依赖安全)
3. [数据安全](#数据安全)
4. [发布安全](#发布安全)

---

## 🔒 代码安全

### 敏感信息处理

#### ✅ API Key管理
- [ ] **不在代码中硬编码API Key**
  ```typescript
  // ❌ 禁止
  const apiKey = 'sk-ant-xxx';
  
  // ✅ 推荐
  const apiKey = process.env.ANTHROPIC_AUTH_TOKEN;
  ```

- [ ] **不在Git中提交敏感文件**
  ```bash
  # .gitignore
  .env
  .env.local
  *.key
  *.pem
  ```

- [ ] **使用环境变量**
  ```bash
  # .env.example
  ANTHROPIC_AUTH_TOKEN=your-token-here
  CLAUDE_CLI_PATH=/usr/bin/claude
  ```

#### ✅ 文件路径安全
- [ ] **验证文件路径**
  ```typescript
  // 验证路径在项目目录内
  import path from 'path';
  import { isProjectPath } from '@/shared/utils';
  
  if (!isProjectPath(filePath)) {
    throw new Error('路径不在项目目录内');
  }
  ```

- [ ] **限制文件访问**
  ```typescript
  // 只允许访问项目目录
  const PROJECT_ROOT = process.cwd();
  const safePath = path.resolve(PROJECT_ROOT, userPath);
  ```

- [ ] **防止路径遍历**
  ```typescript
  // 检查.././
  if (userPath.includes('..')) {
    throw new Error('不允许使用相对路径');
  }
  ```

### 权限控制

#### ✅ 最小权限原则
- [ ] **只请求必要的权限**
  ```typescript
  // 只请求读取权限
  ipcMain.handle('file:read', async (event, filePath) => {
    // 只读取，不修改
  });
  ```

- [ ] **限制IPC频道**
  ```typescript
  // 白名单机制
  const ALLOWED_CHANNELS = [
    'file:read',
    'file:write',
    'cli:start',
    'cli:stop'
  ];
  ```

- [ ] **验证输入**
  ```typescript
  // 验证输入参数
  if (typeof content !== 'string') {
    throw new Error('内容必须是字符串');
  }
  ```

### 代码注入防护

#### ✅ 命令注入
- [ ] **避免直接执行用户输入**
  ```typescript
  // ❌ 危险
  const result = eval(userInput);
  
  // ✅ 安全
  const result = JSON.parse(userInput);
  ```

- [ ] **使用参数化查询**
  ```typescript
  // 使用参数化查询
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  ```

#### ✅ XSS防护
- [ ] **转义用户输入**
  ```typescript
  // 转义HTML特殊字符
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };
  ```

- [ ] **Content Security Policy**
  ```html
  <!-- meta标签 -->
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">
  ```

---

## 📦 依赖安全

### 依赖审查

#### ✅ 定期更新
- [ ] **每周检查依赖更新**
  ```bash
  pnpm outdated
  pnpm update
  ```

- [ ] **使用npm audit**
  ```bash
  pnpm audit
  pnpm audit fix
  ```

- [ ] **检查已知漏洞**
  ```bash
  pnpm audit --production
  ```

#### ✅ 锁定依赖版本
- [ ] **使用lockfile**
  ```json
  {
    "pnpm": {
      "overrides": {
        "package": "version"
      }
    }
  }
  ```

- [ ] **定期更新lockfile**
  ```bash
  pnpm install
  git commit pnpm-lock.yaml
  ```

### 第三方库

#### ✅ 使用可信库
- [ ] **检查库的维护状态**
  - 最后更新时间
  - 维护者活跃度
  - Issue响应时间

- [ ] **检查库的安全性**
  - 安全报告
  - 已知漏洞
  - 社区反馈

---

## 🔐 数据安全

### 数据加密

#### ✅ 传输加密
- [ ] **使用HTTPS**
  ```typescript
  // API通信使用HTTPS
  const API_BASE = 'https://api.anthropic.com';
  ```

- [ ] **验证证书**
  ```typescript
  // 验证SSL证书
  https.get(options, (res) => {
    if (res.statusCode === 200) {
      // 验证通过
    }
  });
  ```

#### ✅ 存储加密
- [ ] **敏感数据加密存储**
  ```typescript
  // 使用加密存储
  const encrypted = CryptoJS.AES.encrypt(
    apiKey,
    encryptionKey
  ).toString();
  ```

- [ ] **使用系统Keychain**
  ```typescript
  // macOS Keychain
  // Windows Credential Manager
  // Linux Secret Service
  ```

### 数据最小化

#### ✅ 只收集必要数据
- [ ] **不收集不必要的用户信息**
  - 只收集必要的数据
  - 明确告知数据用途

- [ ] **数据匿名化**
  ```typescript
  // 脱敏API Key
  const masked = apiKey.slice(0, 8) + '****' + apiKey.slice(-4);
  ```

- [ ] **定期清理**
  ```typescript
  // 定期清理旧数据
  const cleanOldData = () => {
    const cutoffDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
    // 删除30天前的数据
  };
  ```

---

## 🚀 发布安全

### 代码签名

#### ✅ macOS代码签名
- [ ] **获取开发者证书**
  ```bash
  # 从Apple Developer账号获取
  security find-identity -v -s "Developer ID Application"
  ```

- [ ] **签名应用**
  ```bash
  # 签名DMG
  codesign --sign "ClaudeCode-UI.dmg" \
    --sign "Developer ID Application: YOUR_ID"
  ```

#### ✅ Windows代码签名
- [ ] **获取代码签名证书**
  ```bash
  # 从DigiCert/Sectigo等CA获取
  ```

- [ ] **签名EXE**
  ```bash
  # 签名EXE
  signtool sign /f certificate.pfx /a password /t http://timestamp.digicert.com \
    "ClaudeCode-UI-Setup.exe"
  ```

### 构建安全

#### ✅ 构建环境隔离
- [ ] **使用CI/CD构建**
  ```yaml
  # .github/workflows/build.yml
  - name: Build
    run: pnpm build
    env:
      NODE_ENV: production
  ```

- [ ] **不在构建中暴露密钥**
  ```yaml
  # 使用GitHub Secrets
  - name: Build
    env:
      API_KEY: ${{ secrets.API_KEY }}
  ```

#### ✅ 构建产物验证
- [ ] **验证构建完整性**
  ```bash
  # 检查构建文件
  ls -lh dist/
  ```

- [ ] **测试安装包**
  ```bash
  # 安装测试
  # 确保安装包可以正常安装和运行
  ```

### 发布流程

#### ✅ 版本发布
- [ ] **语义化版本号**
  ```
  MAJOR.MINOR.PATCH
  - 主版本号：不兼容的API变更
  - 次版本号：向后兼容的功能新增
  - 修订号：向后兼容的Bug修复
  ```

- [ ] **标签管理**
  ```bash
  # 创建Git标签
  git tag -a v0.5.0 -m "Release v0.5.0"
  git push origin v0.5.0
  ```

- [ ] **Release Notes**
  ```markdown
  ## [0.5.0] - 2026-04-22
  
  ### Added
  - 新功能1
  - 新功能2
  
  ### Fixed
  - Bug修复1
  - Bug修复2
  
  ### Security
  - 安全更新
  ```

---

## 🔍 安全检查工具

### 自动化工具

#### ✅ 使用npm audit
```bash
# 检查依赖漏洞
pnpm audit

# 自动修复
pnpm audit fix
```

#### ✅ 使用Snyk
```bash
# 安装Snyk
npm install -g snyk

# 扫描项目
snyk test
```

#### ✅ 使用CodeQL
```bash
# GitHub CodeQL集成
# 自动扫描代码漏洞
```

### 手动检查

#### ✅ 代码审查清单
- [ ] 审查所有文件读写操作
- [ ] 审查所有外部API调用
- [ ] 审查所有用户输入处理
- [ ] 审查所有网络请求
- [ ] 审查所有命令执行

#### ✅ 渗透测试
- [ ] SQL注入测试
- [ ] XSS测试
- [ ] CSRF测试
- [ ] 路径遍历测试
- [ ] 命令注入测试

---

## 📋 安全检查周期

### 日常检查
- [ ] 每周：依赖更新检查
- [ ] 每周：npm audit运行
- [ ] 每月：代码安全审查

### 发布前检查
- [ ] 依赖漏洞扫描
- [ ] 代码安全审查
- [ ] 渗透测试
- [ ] 性能测试
- [ ] 用户体验测试

### 应急响应
- [ ] 发现漏洞立即修复
- [ ] 安全事件响应计划
- [ ] 用户通知机制
- [ ] 回滚计划

---

## 🎯 安全优先级

### P0 - 关键（立即修复）
- 远程代码执行
- SQL注入
- XSS攻击
- 敏感数据泄露

### P1 - 重要（24小时内修复）
- 认证绕过
- 权限提升
- 数据泄露
- 中间件漏洞

### P2 - 中等（一周内修复）
- 信息泄露
- 性能问题
- 配置错误
- 文档错误

### P3 - 低等（一个月内修复）
- 优化建议
- 代码清理
- 文档改进

---

## 📞 安全问题报告

### 如何报告安全问题

1. **不要公开issue**
   - 安全问题不应通过公开issue报告
   - 应通过私密渠道报告

2. **发送邮件**
   - 📧 Email: 14455975@qq.com
   - 标题：[安全] ClaudeCode UI App - 安全问题报告

3. **提供详细信息**
   - 问题描述
   - 复现步骤
   - 影响范围
   - 建议修复方案

4. **响应时间**
   - P0关键问题：24小时内响应
   - P1重要问题：48小时内响应
   - P2中等问题：一周内响应

---

## ✅ 安全检查确认

### 发布前检查

- [ ] 所有依赖已更新
- [ ] 无已知高危漏洞
- [ ] 代码签名完成
- [ ] 安全测试通过
- [ ] 文档已更新

### 持续监控

- [ ] 监控依赖更新
- [ ] 监控安全公告
- [ ] 收集用户反馈
- [ ] 定期安全审计

---

**检查完成时间**：2026-04-22
**下次检查时间**：每周五或发布前

**Be water, my friend!** 🤙
