# 贡献者指南

**版本**：v0.5.0
**更新日期**：2026-04-22

---

## 📚 目录

1. [开始贡献](#开始贡献)
2. [开发流程](#开发流程)
3. [代码规范](#代码规范)
4. [测试规范](#测试规范)
5. [文档规范](#文档规范)
6. [Pull Request流程](#pull-request流程)

---

## 🚀 开始贡献

### 谁可以贡献？

- ✅ 开发者（功能开发、Bug修复）
- ✅ 设计师（UI/UX设计）
- ✅ 文档维护者（文档改进）
- ✅ 测试工程师（测试用例编写）
- ✅ 社区参与者（问题反馈、建议）

### 贡献类型

**代码贡献**
- 新功能开发
- Bug修复
- 性能优化
- 重构改进

**非代码贡献**
- 文档完善
- 测试用例
- Bug报告
- 功能建议
- 代码审查

---

## 🔄 开发流程

### 1. Fork项目

```bash
# 1. Fork项目到你的GitHub账号
# 2. 克隆你的Fork
git clone https://github.com/YOUR_USERNAME/claudecode_ui_app.git
cd claudecode_ui_app

# 3. 添加上游仓库
git remote add upstream https://github.com/changzhi777/claudecode_ui_app.git
```

### 2. 创建分支

```bash
# 同步主分支
git checkout main
git pull upstream main

# 创建功能分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 3. 开发与测试

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

### 4. 提交代码

```bash
# 查看更改
git status
git diff

# 暂存文件
git add .

# 提交（遵循Commit规范）
git commit -m "feat: add your feature"
```

### 5. 推送到你的Fork

```bash
git push origin feature/your-feature-name
```

### 6. 创建Pull Request

1. 访问GitHub项目页面
2. 点击 "New Pull Request"
3. 填写PR模板
4. 等待Code Review

---

## 📝 代码规范

### TypeScript规范

**命名约定**：
```typescript
// ✅ 好的命名
interface UserData {
  userId: string;
  userName: string;
}

class UserManager {
  private userId: string;
  
  public async getUser(): Promise<UserData> {
    // 实现
  }
}

const MAX_RETRY_COUNT = 3;

// ❌ 避免的命名
interface userdata {}
class user_manager {}
const max_retry_count = 3;
```

**类型定义**：
```typescript
// ✅ 使用interface定义对象类型
interface Message {
  id: string;
  content: string;
  timestamp: number;
}

// ✅ 使用type定义联合类型
type Status = 'pending' | 'running' | 'completed';

// ✅ 避免any
const data: unknown = result;
if (typeof data === 'string') {
  // ...
}
```

**函数设计**：
```typescript
// ✅ 好的函数设计
async function fetchUserData(userId: string): Promise<UserData> {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// ❌ 避免的函数设计
function getUser(u) { // 缺少类型
  return fetch('/api/users/' + u); // 使用模板字符串
}
```

### React规范

**组件设计**：
```typescript
// ✅ 好的组件设计
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
}) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// ❌ 避免的组件设计
export const Button = (props: any) => { // 使用any
  return <button onclick={props.onClick}>{props.label}</button>; // 小写onclick
};
```

**Hooks使用**：
```typescript
// ✅ 正确使用Hooks
const [count, setCount] = useState(0);
const effect = useEffect(() => {
  // 副作用
}, [dependencies]);

// ❌ 避免的Hooks使用
const [count, setCount] = useState(); // 缺少类型
useEffect(() => {
  // 副作用
}); // 缺少依赖数组
```

### 代码格式化

**使用Prettier**：
```bash
pnpm format
```

**配置文件**：`.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 🧪 测试规范

### 单元测试

**编写测试**：
```typescript
describe('UserService', () => {
  it('应该获取用户数据', async () => {
    const user = await fetchUser('user-123');
    expect(user.id).toBe('user-123');
  });

  it('应该处理错误', async () => {
    await expect(fetchUser('invalid')).rejects.toThrow();
  });
});
```

**测试覆盖率**：
- 目标：≥80%
- 关键路径：100%
- 使用`pnpm test:coverage`检查

### 集成测试

**编写测试**：
```typescript
describe('CLI通信集成测试', () => {
  it('应该接收JSON格式的输出', async () => {
    const process = new CLIProcess(config);
    await process.start();
    
    // 测试逻辑
  }, 10000);
});
```

### E2E测试

**编写测试**：
```typescript
test('完整对话流程', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 输入消息
  await page.fill('[data-testid="chat-input"]', 'Hello');
  await page.click('[data-testid="send-button"]');
  
  // 等待响应
  await page.waitForSelector('[data-testid="ai-response"]');
  
  // 验证内容
  const response = await page.textContent('[data-testid="ai-response"]');
  expect(response).toContain('Hello');
});
```

---

## 📚 文档规范

### 代码注释

**函数注释**：
```typescript
/**
 * 发送消息到AI
 * 
 * @param content - 消息内容
 * @param sessionId - 会话ID
 * @returns Promise<{ success: boolean; error?: string }>
 * 
 * @example
 * ```typescript
 * const result = await sendMessage('Hello', 'session-123');
 * if (result.success) {
 *   console.log('Message sent');
 * }
 * ```
 */
async function sendMessage(
  content: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  // 实现
}
```

**文件注释**：
```typescript
/**
 * @fileoverview CLI进程池管理模块
 * 
 * 负责管理多个CLI进程的生命周期，包括：
 * - 进程创建和销毁
 * - 进程分配和回收
 * - 健康检查和自动重启
 * 
 * @author BB小子
 * @since 0.5.0
 */
```

### README规范

**更新README**：
- 新功能：添加到功能列表
- 新依赖：更新技术栈
- 新文档：添加到文档链接
- 截图：更新项目截图

---

## 🔀 Pull Request流程

### PR模板

**标题格式**：
```
<type>(<scope>): <subject>
```

**类型**：
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**：
```
feat(worker): add retry mechanism for failed messages
fix(cli): resolve connection timeout issue
docs(readme): update installation instructions
```

### PR描述

**必须包含**：
1. **变更说明**：详细描述你的更改
2. **测试说明**：如何测试你的更改
3. **截图**：如果是UI更改，提供截图
4. **关联Issue**：`Fixes #123` 或 `Relates to #123`

**示例**：
```markdown
## 变更说明
添加了消息重试机制，当网络失败时自动重试最多3次。

## 测试说明
1. 启动应用
2. 发送消息
3. 断开网络
4. 观察自动重试

## 截图
![截图](screenshot.png)

## 关联Issue
Fixes #456
```

### Code Review

**审查要点**：
1. 代码质量
2. 测试覆盖
3. 文档更新
4. 性能影响
5. 安全考虑

**响应时间**：
- 维护者会在48小时内响应
- 请及时回应审查意见

### 合并标准

**必须满足**：
- [ ] 所有测试通过
- [ ] 代码检查通过
- [ ] 文档已更新
- [ ] 至少一个维护者批准

### 合并后

**步骤**：
1. Squash合并到main分支
2. 删除功能分支
3. 更新CHANGELOG

---

## 🎯 贡献者荣誉

### 贡献者列表

所有贡献者将被列在项目README中：

```markdown
## 贡献者

- [@yourname](https://github.com/YOUR_GITHUB_USERNAME) - 贡献内容
```

### 贡献徽章

根据贡献类型，获得徽章：
- 🌟 核心贡献者（10+ commits）
- ⭐ 文档之星（文档贡献）
- 🐛 Bug猎手（Bug修复）
- 🧪 测试专家（测试用例）

---

## 📞 获取帮助

### 沟通渠道

- **GitHub Issues**: 提交问题
- **GitHub Discussions**: 功能讨论
- **Discord**: 实时交流
- **Email**: 14455975@qq.com

### 良好行为准则

**尊重他人**：
- 友好交流
- 接受反馈
- 感激不同观点

**专业性**：
- 技术讨论基于事实
- 避免人身攻击
- 尊重知识产权

**协作精神**：
- 主动帮助他人
- 分享知识
- 共同进步

---

## 🎓 学习资源

### 项目文档

- [用户使用指南](./用户使用指南.md)
- [开发者指南](./开发者指南.md)
- [项目FAQ](./FAQ.md)
- [CLAUDE.md](../CLAUDE.md)

### 外部资源

- [Electron文档](https://www.electronjs.org/docs)
- [React文档](https://react.dev)
- [TypeScript文档](https://www.typescriptlang.org/docs)

---

## ✨ 感谢你的贡献！

**每一个贡献都是宝贵的！**

无论是代码、文档、Bug报告还是功能建议，我们都非常感谢。

**让我们一起打造更好的开发工具！**

---

**最后更新**：2026-04-22
**维护者**：BB小子 🤙

**Be water, my friend!** 🤙
