# FitnessAdvice

一个本地运行的健身评估与可视化小工具，根据你的图片和文字描述，生成个性化的体态评估、训练建议和图表。

## 项目结构

- `index.html`：页面主体结构
- `styles.css`：页面样式
- `app.js`：前端逻辑（上传图片、调用接口、渲染结果和图表、导出 PNG / Word 等）
- `config.js`：配置大模型 API Key 和接口地址
- `config.example.js`：配置示例（可复制为 `config.js` 使用）
- `package.json` / `package-lock.json`：npm 依赖说明
- `start.bat` / `start.sh`：本地启动静态服务器的脚本

> 说明：如果你只打算直接用浏览器打开 `index.html` 体验功能，`start.bat` / `start.sh` 不是必须的。

## 本地运行

1. （可选）安装依赖：
   ```bash
   npm install
   ```
2. 配置接口（如需真实调用大模型）：
   - 复制 `config.example.js` 为 `config.js`
   - 在 `config.js` 中填写你的 API Key 和 接口地址
3. 启动本地静态服务器（任选一种方式）：
   - Windows：双击 `start.bat`
   - macOS / Linux：在项目目录执行 `./start.sh`
   - 或使用你自己的静态服务器（如 VS Code Live Server、`npx serve` 等）
4. 浏览器访问终端输出的地址（通常是 `http://localhost:8000` 或类似端口），即可使用页面。

## 导出功能说明

- **导出 PNG**：只会截取结果区域，并使用纯白背景，适合插入到文档或 PPT 中。
- **导出 Word**：会将文字内容和结构导出为 `.docx` 文件，方便二次编辑。

## 二次开发建议

- 样式相关统一在 `styles.css` 中修改（颜色、字体、布局等）。
- 交互逻辑和图表渲染在 `app.js` 中，如需新增图表、修改导出逻辑，可以在这里调整。
- 如需接入其它模型或自建后端，可以在 `config.js` 中增加配置，然后在 `app.js` 的调用处切换。


