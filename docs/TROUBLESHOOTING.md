# 故障排查指南

**版本**：v0.5.0
**更新日期**：2026-04-22
**作者**：BB小子 🤙

---

## 📋 目录

1. [常见问题](#常见问题)
2. [测试故障](#测试故障)
3. [性能问题](#性能问题)
4. [CLI连接问题](#cli连接问题)
5. [构建问题](#构建问题)
6. [调试技巧](#调试技巧)

---

## 🔥 常见问题

### Q1: 应用启动后白屏

**症状**：Electron窗口打开但显示空白

**排查步骤**：
```bash
# 1. 检查渲染进程控制台
# 开发者工具 -> Console

# 2. 检查主进程日志
# 查看终端输出

# 3. 验证Vite开发服务器
curl http://localhost:5173
```

**常见原因**：
- Vite开发服务器未启动 → 运行 `pnpm dev:renderer`
- 端口被占用 → 修改vite配置中的端口
- 路径配置错误 → 检查`vite.config.ts`

---

### Q2: CLI无响应

**症状**：点击发送消息后没有任何反应

**排查步骤**：
```bash
# 1. 检查CLI路径配置
cat ~/.claudecode-ui/config.json

# 2. 验证CLI是否可执行
which claude
claude --version

# 3. 检查进程状态
ps aux | grep claude
```

**解决方案**：
```typescript
// 设置正确的CLI路径
// 设置 -> CLI路径 -> /usr/local/bin/claude
```

---

### Q3: 测试全部失败

**症状**：运行`pnpm test`后大量测试失败

**错误信息**：
```
Error: spawn /usr/bin/claude ENOENT
```

**原因**：集成测试需要真实的Claude CLI环境

**解决方案**：
```bash
# 方案1: 跳过集成测试
pnpm test:run --reporter=verbose 2>&1 | grep -v "CLIProcess"

# 方案2: 使用Mock测试
vitest run --mock
```

**预期行为**：
- 单元测试：应该全部通过（77个）
- 集成测试：需要真实CLI环境（28个会失败）

---

## 🧪 测试故障

### 单元测试失败

**示例错误**：
```
FAIL src/stores/__tests__/cliStore.test.ts
  ● 应该添加消息
    assert.equal('sk-***abcd', maskedKey)
           ^
    expected 'sk-***abcd' but got 'sk-ant-***1234'
```

**解决方案**：
```typescript
// 检查API key masking逻辑
const maskApiKey = (key: string) => {
  if (key.startsWith('sk-ant-')) {
    return key.slice(0, 8) + '****' + key.slice(-4);
  }
  return key.slice(0, 7) + '****' + key.slice(-4);
};
```

---

### Mock配置问题

**症状**：Mock函数没有被调用

**检查清单**：
```typescript
// 1. 确认vi.mock在文件顶部
vi.mock('../CLIProcess', () => ({
  CLIProcess: vi.fn()
}));

// 2. 导入Mock模块
import { CLIProcess } from '../CLIProcess';

// 3. 验证Mock调用
expect(CLIProcess).toHaveBeenCalledWith(expect.anything());
```

---

## ⚡ 性能问题

### 启动速度慢

**症状**：应用启动超过3秒

**分析工具**：
```typescript
// 在main/index.ts添加性能监控
const startTime = Date.now();

app.whenReady().then(() => {
  const duration = Date.now() - startTime;
  console.log(`启动耗时: ${duration}ms`);

  if (duration > 3000) {
    console.warn('启动时间过长，建议优化');
  }
});
```

**优化方向**：
1. 延迟加载非关键模块
2. 优化Vite构建配置
3. 启用Electron缓存

---

### 内存占用高

**症状**：应用占用超过500MB内存

**排查步骤**：
```bash
# macOS
ps aux | grep ClaudeCode

# 查看详细内存信息
top -pid <PID> -stats memory
```

**优化建议**：
```typescript
// 1. 清理旧的会话数据
setInterval(() => {
  const sessions = getSessionList();
  sessions.forEach(session => {
    if (Date.now() - session.lastActive > 7 * 24 * 60 * 60 * 1000) {
      deleteSession(session.id);
    }
  });
}, 24 * 60 * 60 * 1000);

// 2. 限制Monaco Editor实例数量
const MAX_EDITORS = 3;
```

---

## 🔌 CLI连接问题

### 找不到Claude CLI

**错误信息**：
```
Error: spawn claude ENOENT
```

**解决方案**：

**方法1：使用绝对路径**
```bash
# 查找CLI位置
which claude
# 输出: /usr/local/bin/claude

# 在应用中配置
设置 -> CLI路径 -> /usr/local/bin/claude
```

**方法2：添加到PATH**
```bash
# 编辑shell配置
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

### CLI参数错误

**症状**：CLI启动后立即退出

**检查参数**：
```typescript
// 正确的启动参数
const CLI_ARGS = [
  '--print',
  '--input-format', 'stream-json',
  '--output-format', 'stream-json',
  '--verbose'
];

// 错误的参数（缺少--print）
const WRONG_ARGS = [
  '--input-format', 'stream-json',
  '--output-format', 'stream-json'
];
```

---

## 🏗️ 构建问题

### macOS代码签名失败

**错误信息**：
```
error: code signing is required
```

**解决方案**：
```bash
# 1. 获取开发者证书
security find-identity -v -s "Developer ID Application"

# 2. 临时禁用签名（仅开发）
# electron-builder.yml
mac:
  hardenedRuntime: false
  gatekeeperAssess: false
```

---

### Windows构建失败

**错误信息**：
```
Error: ns-blob.exe not found
```

**解决方案**：
```bash
# 清理缓存并重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# 使用Windows构建
pnpm package:win
```

---

## 🐛 调试技巧

### Chrome DevTools

**主进程调试**：
```bash
# 启动时添加--inspect参数
electron --inspect=5858 out/main/index.js

# 在Chrome访问
chrome://inspect
```

**渲染进程调试**：
```javascript
// main/index.ts
mainWindow.webContents.openDevTools();
```

---

### 日志调试

**添加详细日志**：
```typescript
// 创建日志工具
class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any) {
    console.log(`[${this.context}] ${message}`, data || '');
  }

  error(message: string, error: Error) {
    console.error(`[${this.context}] ${message}`, error);
  }
}

// 使用
const log = new Logger('CLIProcess');
log.info('启动CLI进程', { pid: process.pid });
```

---

### IPC消息追踪

**监控所有IPC消息**：
```typescript
// main/index.ts
ipcMain.on('trace', (event) => {
  console.log('IPC消息:', event.channel, event.args);
});

// renderer
window.electron.ipcRenderer.send('trace', { data: 'test' });
```

---

### 网络请求调试

**抓包分析**：
```bash
# 使用tcpdump
sudo tcpdump -i any -s 0 -w api.pcap port 443

# 使用Wireshark打开
open api.pcap
```

---

## 📊 性能监控

### 性能指标收集

**添加性能监控面板**：
```typescript
// 创建性能监控Store
interface PerformanceMetrics {
  startupTime: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

const usePerformanceStore = create<PerformanceMetrics>(() => ({
  startupTime: 0,
  responseTime: 0,
  memoryUsage: 0,
  cpuUsage: 0
}));

// 定期收集
setInterval(() => {
  const metrics = process.memoryUsage();
  usePerformanceStore.setState({
    memoryUsage: metrics.heapUsed / 1024 / 1024
  });
}, 5000);
```

---

## 🔧 高级技巧

### Worker线程调试

**调试CLI Worker**：
```typescript
// cli-worker.ts
self.onerror = (error) => {
  console.error('Worker错误:', error);
  postMessage({
    type: 'error',
    payload: error.message
  });
};

// 添加性能监控
const startTime = performance.now();
// ... 执行任务
const duration = performance.now() - startTime;
if (duration > 100) {
  console.warn(`任务耗时过长: ${duration}ms`);
}
```

---

### Electron进程崩溃恢复

**自动重启机制**：
```typescript
// main/index.ts
app.on('renderer-process-crashed', (event, webContents, killed) => {
  console.error('渲染进程崩溃:', killed);

  // 保存状态
  const state = webContents.executeJavaScript('localStorage.getItem("state")');

  // 重新加载
  webContents.reload();
});
```

---

## 📞 获取帮助

### 社区支持

- **GitHub Issues**: https://github.com/changzhi777/claudecode_ui_app/issues
- **Email**: 14455975@qq.com
- **微信群**: 扫码加入

### 提交问题时请包含

1. 系统信息：
```bash
sw_vers  # macOS
ver      # Windows
lsb_release -a  # Linux
```

2. 应用版本：
```bash
grep '"version"' package.json
```

3. 错误日志：
```bash
~/Library/Logs/ClaudeCode UI/
```

4. 复现步骤：
- 详细的操作步骤
- 预期行为 vs 实际行为
- 截图或录屏

---

## 🎯 快速诊断清单

遇到问题时，按顺序检查：

- [ ] 应用版本是否最新？
- [ ] Node.js版本 >= 18？
- [ ] 依赖是否完整安装？
- [ ] CLI路径配置是否正确？
- [ ] 防火墙/杀毒软件是否拦截？
- [ ] 日志中有错误信息吗？
- [ ] 重启应用能否解决？
- [ ] 重启系统能否解决？

---

**更新日期**：2026-04-22
**下次更新**：发现新问题时

Be water, my friend! 🤙
