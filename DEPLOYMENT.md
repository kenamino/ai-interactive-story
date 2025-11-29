# 🚀 部署说明

## 项目已成功上传到 GitHub！

**仓库地址**：https://github.com/kenamino/ai-interactive-story

## 启用 GitHub Pages（在线访问）

要让项目可以在线访问，请按照以下步骤启用 GitHub Pages：

### 步骤 1：访问仓库设置

1. 打开仓库页面：https://github.com/kenamino/ai-interactive-story
2. 点击页面顶部的 **Settings**（设置）选项卡

### 步骤 2：配置 GitHub Pages

1. 在左侧菜单中找到 **Pages** 选项
2. 在 **Source** 部分：
   - Branch（分支）：选择 `main`
   - Folder（文件夹）：选择 `/ (root)`
3. 点击 **Save**（保存）按钮

### 步骤 3：等待部署

- GitHub 会自动构建和部署网站
- 通常需要 1-3 分钟
- 部署完成后，页面会显示访问链接

### 步骤 4：访问你的网站

部署完成后，你的网站将可以通过以下地址访问：

**https://kenamino.github.io/ai-interactive-story/**

## 🎉 使用说明

1. 访问网站后，首先需要输入你的 OpenAI API Key
2. API Key 会安全地保存在浏览器本地
3. 选择一个故事类型或自定义开局
4. 享受你的 AI 互动小说之旅！

## 📝 后续更新

如果你想更新网站内容：

```bash
# 1. 修改文件后提交
git add .
git commit -m "更新说明"
git push

# 2. GitHub Pages 会自动重新部署
```

## 🔧 本地测试

如果想在本地测试：

1. 直接用浏览器打开 `index.html` 文件
2. 或者使用简单的 HTTP 服务器：

```bash
# Python 3
python3 -m http.server 8000

# 然后访问 http://localhost:8000
```

## 💡 提示

- 确保你有有效的 OpenAI API Key
- API Key 可以在 https://platform.openai.com/api-keys 获取
- 使用 GPT-4o-mini 模型，成本较低
- 所有数据都在浏览器本地，不会上传到服务器

---

祝你使用愉快！✨
