// 全局变量
let uploadController = null;
let currentFile = null;
let fitnessAdvice = '';
let aiMetrics = null;
let aiCharts = null;


// DOM元素
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const cancelBtn = document.getElementById('cancelBtn');
const loadingView = document.getElementById('loadingView');
const resultView = document.getElementById('resultView');
const resultContent = document.getElementById('resultContent');
const downloadWord = document.getElementById('downloadWord');
const downloadPng = document.getElementById('downloadPng');
const newAnalysis = document.getElementById('newAnalysis');
const compactModeCheckbox = document.getElementById('compactMode');

// 事件监听
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
cancelBtn.addEventListener('click', cancelUpload);
downloadWord.addEventListener('click', exportToWord);
if (downloadPng) {
    downloadPng.addEventListener('click', exportToPNG);
}
newAnalysis.addEventListener('click', resetApp);

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    // 验证文件大小（5MB = 5 * 1024 * 1024 bytes）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('文件大小不能超过5MB！');
        return;
    }

    currentFile = file;

    // 上传图片后隐藏上传区域（按钮和提示文字）
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        uploadSection.style.display = 'none';
    }

    uploadFile(file);
}

// 上传文件
async function uploadFile(file) {
    // 显示进度条
    uploadProgress.style.display = 'block';
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    // 创建AbortController用于取消上传
    uploadController = new AbortController();

    try {
        // 模拟上传进度
        await simulateUpload();

        // 上传完成后，调用AI分析
        await analyzeImage(file);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('上传已取消');
            resetProgress();
        } else {
            alert('上传失败：' + error.message);
            resetProgress();
        }
    }
}

// 模拟上传进度
function simulateUpload() {
    return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
            if (uploadController.signal.aborted) {
                clearInterval(interval);
                reject(new DOMException('Upload cancelled', 'AbortError'));
                return;
            }

            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                resolve();
            }

            progressBar.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
        }, 200);
    });
}

// 取消上传
function cancelUpload() {
    if (uploadController) {
        uploadController.abort();
    }

    // 取消上传时恢复显示上传区域（按钮和提示文字）
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        uploadSection.style.display = 'block';
    }
}

// 重置进度条
function resetProgress() {
    uploadProgress.style.display = 'none';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    fileInput.value = '';
}

// 分析图片
async function analyzeImage(file) {
    // 隐藏进度条，显示加载动画
    uploadProgress.style.display = 'none';
    loadingView.style.display = 'block';

    try {
        // 将图片转换为base64
        const base64Image = await fileToBase64(file);

        // 调用AI API（这里需要替换为实际的API）
        const advice = await callAIAPI(base64Image);

        // 显示结果
        showResult(advice);

        // 延迟初始化图表，确保DOM已渲染
        setTimeout(() => {
            initCharts();
        }, 100);
    } catch (error) {
        alert('AI分析失败：' + error.message);
        loadingView.style.display = 'none';
        resetProgress();
    }
}

// 文件转base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 调用AI API
async function callAIAPI(base64Image) {
    // 检查是否配置了API
    if (typeof API_CONFIG !== 'undefined' &&
        API_CONFIG.endpoint !== 'YOUR_API_ENDPOINT' &&
        API_CONFIG.apiKey !== 'YOUR_API_KEY') {

        try {
            const useCompact = compactModeCheckbox && compactModeCheckbox.checked;
            const promptText = (useCompact && API_CONFIG.compactPromptTemplate)
                ? API_CONFIG.compactPromptTemplate
                : API_CONFIG.promptTemplate;

            const response = await fetch(API_CONFIG.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: API_CONFIG.model,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: promptText },
                                { type: 'image_url', image_url: { url: base64Image } }
                            ]
                        }
                    ],
                    max_tokens: API_CONFIG.maxTokens || 2000
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();

            // OpenAI 格式优先
            if (data.choices && data.choices[0]) {
                return ensureChartsInAdvice(data.choices[0].message.content);
            }

            const raw = data.output || data.result || data.text || '';
            return ensureChartsInAdvice(raw || generateMockAdvice());

        } catch (error) {
            console.error('API调用失败，使用模拟数据:', error);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return generateMockAdvice();
        }
    } else {
        console.log('使用模拟数据（请在config.js中配置真实的API）');
        await new Promise(resolve => setTimeout(resolve, 3000));
        return generateMockAdvice();
    }
}

// 确保建议 HTML 中始终包含数据卡片和图表区域
function ensureChartsInAdvice(rawHtml) {
    // 每次处理前先重置指标，避免复用上一次的值
    aiMetrics = null;

    if (!rawHtml || typeof rawHtml !== 'string') {
        // 返回仅包含文字内容的模拟建议
        return generateMockAdvice();
    }

    // 先尝试从 HTML 中解析出 AI 返回的 JSON 指标，并移除注释
    rawHtml = extractAiMetricsFromHtml(rawHtml);

    // 只保留从第一个 <h3> 开始的内容（去掉模型可能输出的<html>等包裹标签）
    const firstH3Index = rawHtml.indexOf('<h3');
    const mainContent = firstH3Index !== -1 ? rawHtml.slice(firstH3Index) : rawHtml;

    // 如果成功拿到指标，则在文字前拼接数据卡片，并在后面追加图表区域
    if (aiMetrics) {
        return `
${generateStaticHeaderAndCards()}
${mainContent}
${generateStaticChartsHtml()}
`;
    }

    // 否则只返回文字内容，不强行生成带假数据的图表
    return mainContent;
}

// 从模型返回的 HTML 中提取 JSON 指标（位于形如 <!--DATA: {...}--> 的注释里）
function extractAiMetricsFromHtml(rawHtml) {
    try {
        const match = rawHtml.match(/<!--\s*DATA:\s*(\{[\s\S]*?\})\s*-->/);
        if (!match) {
            return rawHtml;
        }

        const jsonStr = match[1];
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object') {
            aiMetrics = parsed;
        } else {
            aiMetrics = null;
        }

        // 移除注释，避免出现在最终页面中
        return rawHtml.replace(match[0], '');
    } catch (e) {
        console.warn('解析 AI 指标 JSON 失败:', e);
        aiMetrics = null;
        return rawHtml;
    }
}

// 固定的数据卡片区（与页面展示保持一致）
function generateStaticHeaderAndCards() {
    const data = aiMetrics || {};

    const bmiValue = typeof data.bmi === 'number' ? data.bmi.toFixed(1) : '--';
    const bmiStatus = data.bmiStatus || '暂无数据';

    const bodyFatValue = typeof data.bodyFat === 'number' ? `${data.bodyFat}%` : '--';
    const bodyFatStatus = data.bodyFatStatus || '暂无数据';

    const targetBodyFatValue = typeof data.targetBodyFat === 'number' ? `${data.targetBodyFat}%` : '--';
    const targetBodyFatDesc = data.targetBodyFatDesc || '根据实际情况循序渐进';

    const trainingLevel = data.trainingIntensityLevel || '—';
    const trainingTrend = data.trainingIntensityTrend || '根据体能逐步调整';

    return `
<!-- 数据卡片（根据 AI 指标生成） -->
<div class="data-cards">
    <div class="data-card">
        <div class="label">当前BMI</div>
        <div class="value">${bmiValue}</div>
        <div class="trend">${bmiStatus}</div>
    </div>
    <div class="data-card">
        <div class="label">体脂率估算</div>
        <div class="value">${bodyFatValue}</div>
        <div class="trend">${bodyFatStatus}</div>
    </div>
    <div class="data-card">
        <div class="label">目标体脂率</div>
        <div class="value">${targetBodyFatValue}</div>
        <div class="trend">${targetBodyFatDesc}</div>
    </div>
    <div class="data-card">
        <div class="label">训练强度</div>
        <div class="value">${trainingLevel}</div>
        <div class="trend">${trainingTrend}</div>
    </div>
</div>
`;
}

// 固定的图表区域 HTML（4 个 canvas）
function generateStaticChartsHtml() {
    return `
<!-- 图表区域（固定结构） -->
<div class="charts-section">
    <div class="chart-card">
        <h4>📈 8周体重变化预测</h4>
        <div class="chart-container">
            <canvas id="weightChart"></canvas>
        </div>
    </div>
    <div class="chart-card">
        <h4>💪 肌肉群发展评估</h4>
        <div class="chart-container">
            <canvas id="muscleChart"></canvas>
        </div>
    </div>
    <div class="chart-card">
        <h4>🔥 每周训练强度分布</h4>
        <div class="chart-container">
            <canvas id="intensityChart"></canvas>
        </div>
    </div>
    <div class="chart-card">
        <h4>🥗 营养摄入配比</h4>
        <div class="chart-container">
            <canvas id="nutritionChart"></canvas>
        </div>
    </div>
</div>
`;
}

// 生成模拟建议（本地调试用，也始终包含图表）
function generateMockAdvice() {
    const useCompact = compactModeCheckbox && compactModeCheckbox.checked;

    const fullText = `
<h3>📊 体态分析</h3>
<p>根据您上传的照片分析，我们观察到以下特点：</p>
<ul>
    <li>整体体态：体型匀称，但部分部位仍有进一步优化空间</li>
    <li>肌肉发展：核心肌群与背部力量需要重点加强</li>
    <li>建议重点：改善体态稳定性、增强力量与心肺耐力</li>
</ul>

<h3>💪 训练计划建议</h3>
<p><strong>第一阶段（1-4周）：基础激活与动作学习</strong></p>
<ul>
    <li>周一、三、五：全身力量训练（深蹲、俯卧撑、划船、平板支撑等基础动作）</li>
    <li>周二、四：20-30 分钟中低强度有氧（快走、慢跑或椭圆机）</li>
    <li>周日：完全休息或轻度拉伸，帮助恢复</li>
</ul>

<p><strong>第二阶段（5-8周）：逐步提高训练强度</strong></p>
<ul>
    <li>在保证动作标准的前提下，小幅提高训练重量或次数</li>
    <li>加入更多复合动作（硬拉、箭步蹲、引体向上/下拉等）</li>
    <li>有氧时长可延长至 30-40 分钟，尝试间歇训练模式</li>
</ul>

<h3>🥗 饮食建议</h3>
<p><strong>营养配比建议：</strong></p>
<ul>
    <li>蛋白质：每公斤体重约 1.6-2.0 克，来源包括鸡胸肉、鱼虾、鸡蛋、低脂奶制品、豆制品等</li>
    <li>碳水化合物：以全谷物、杂粮、根茎类为主，如糙米、燕麦、全麦面包、红薯等</li>
    <li>健康脂肪：适量摄入坚果、牛油果、橄榄油、深海鱼油等</li>
    <li>饮水：每天保证 2-3 升清水，少喝含糖饮料和高糖奶茶</li>
</ul>

<h3>⚠️ 注意事项</h3>
<ul>
    <li>训练前务必进行 5-10 分钟动态热身，训练后进行静态拉伸</li>
    <li>根据身体反馈调整训练量，如出现明显疼痛或不适及时减量或休息</li>
    <li>保证每晚 7-8 小时高质量睡眠，有助于恢复与塑形</li>
    <li>如有既往伤病或慢性疾病，建议在专业医生或教练指导下训练</li>
</ul>

<h3>🎯 预期效果</h3>
<p>在坚持执行上述训练与饮食计划 8 周左右后，通常可以期待：</p>
<ul>
    <li>体脂率小幅下降，肌肉线条更加清晰</li>
    <li>核心力量与整体稳定性明显提升</li>
    <li>站姿、坐姿更加挺拔，体态更加自然舒展</li>
    <li>日常精力与精神状态有所改善，对运动的自信心提高</li>
</ul>

<p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
    <strong>💡 温馨提示：</strong>以上建议为通用参考方案，具体训练与饮食安排仍需结合您的身高体重、既往运动基础及身体状况进行个性化调整。如条件允许，建议在线下再咨询专业教练或医生。
</p>
`;

    const compactText = `
<h3>📊 体态与总体建议（精简版）</h3>
<ul>
    <li>整体体态：保持良好基础，但核心与背部仍有提升空间。</li>
    <li>目标方向：改善体态稳定性，增强力量与心肺耐力。</li>
</ul>

<h3>💪 训练要点（精简版）</h3>
<ul>
    <li>每周 3-4 次力量训练：以深蹲、俯卧撑、划船、平板支撑为主。</li>
    <li>每周 2 次有氧：20-30 分钟快走或慢跑，循序渐进。</li>
    <li>训练前后分别做好 5-10 分钟热身与拉伸。</li>
</ul>

<h3>🥗 饮食与生活（精简版）</h3>
<ul>
    <li>蛋白质为主，适量控制精制碳水与高糖饮品。</li>
    <li>多吃蔬菜、水果与优质脂肪（坚果、橄榄油等）。</li>
    <li>每天保证 2L 以上饮水与 7 小时左右睡眠。</li>
</ul>
`;

    const baseText = useCompact ? compactText : fullText;

    return `
${generateStaticHeaderAndCards()}
${baseText}
${generateStaticChartsHtml()}
`.trim();
}

// 显示结果
function showResult(advice) {
    fitnessAdvice = advice;
    loadingView.style.display = 'none';
    resultView.style.display = 'block';
    resultContent.innerHTML = advice;
    resetProgress();
}

// 构建用于导出（Word/PDF）的报告 HTML：将图表 canvas 转成图片，保留当前页面样式结构
function buildPrintableReportInnerHTML() {
    const resultContentEl = document.getElementById('resultContent');
    if (!resultContentEl || !resultContentEl.innerHTML.trim()) {
        return '';
    }

    const clone = resultContentEl.cloneNode(true);

    // 将所有图表 canvas 转换为图片，方便在 Word / PDF 中展示
    const canvases = clone.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        try {
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            img.style.margin = '12px auto';
            canvas.parentNode.replaceChild(img, canvas);
        } catch (e) {
            console.warn('将图表转换为图片失败:', e);
        }
    });

    const wrapper = document.createElement('div');
    wrapper.appendChild(clone);
    return wrapper.innerHTML;
}

// 导出当前结果为 PNG 图片（仅包含 AI 生成的内容区域）
async function exportToPNG() {
    try {
        const source = document.getElementById('resultContent');
        if (!source || !source.innerHTML.trim()) {
            alert('请先生成健身建议后再导出图片');
            return;
        }

        if (typeof html2canvas === 'undefined') {
            alert('图片导出组件未加载，请检查网络后重试');
            return;
        }

        // 克隆一份内容到屏幕外单独渲染，避免影响当前布局
        const clone = source.cloneNode(true);
        // 导出专用：添加纯白背景 class，配合 CSS 中 .result-content.export-plain 使用
        clone.classList.add('export-plain');

        // ⚠️ clone 的 <canvas> 默认是空的，这里把原来的图表画面拷贝过去
        const srcCanvases = source.querySelectorAll('canvas');
        const cloneCanvases = clone.querySelectorAll('canvas');
        srcCanvases.forEach((srcCanvas, index) => {
            const dstCanvas = cloneCanvases[index];
            if (!dstCanvas) return;
            try {
                dstCanvas.width = srcCanvas.width;
                dstCanvas.height = srcCanvas.height;
                const ctx = dstCanvas.getContext('2d');
                ctx.drawImage(srcCanvas, 0, 0);
            } catch (e) {
                console.warn('拷贝图表画面失败:', e);
            }
        });

        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-99999px';
        wrapper.style.top = '0';
        wrapper.style.zIndex = '-1';
        wrapper.style.background = '#ffffff';
        wrapper.style.padding = '24px 24px 28px';

        // 统一使用当前内容宽度，防止生成图片时宽度变化
        const rect = source.getBoundingClientRect();
        clone.style.margin = '0';
        clone.style.background = '#ffffff';
        clone.style.width = Math.round(rect.width) + 'px';

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        const scale = window.devicePixelRatio && window.devicePixelRatio > 1 ? 2 : 1;
        const canvas = await html2canvas(clone, {
            scale,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        // 清理临时节点
        document.body.removeChild(wrapper);

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `健身建议_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('PNG图片导出成功');
    } catch (error) {
        console.error('导出PNG失败:', error);
        alert('导出PNG失败：' + error.message);
    }
}



// 导出为Word（仅导出文字内容，不包含图片和图表）
async function exportToWord() {
    try {
        // 基于当前的健身建议 HTML，移除所有图片和图表，只保留文字相关结构
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fitnessAdvice || (resultContent ? resultContent.innerHTML : '');

        // 移除图表和图片（canvas、img 以及图表容器）
        const nodesToRemove = tempDiv.querySelectorAll('.charts-section, .chart-card, canvas, img, .data-card');
        nodesToRemove.forEach(node => node.remove());

        const innerHTML = tempDiv.innerHTML;
        if (!innerHTML || !innerHTML.trim()) {
            alert('请先生成健身建议后再导出Word');
            return;
        }

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.8; padding: 40px; }
        h1 { color: #667eea; text-align: center; margin: 0 0 6px 0; }
        h3 { color: #2d3748; margin-top: 22px; margin-bottom: 12px; border-bottom: 2px solid #667eea; padding-bottom: 6px; }
        p { margin: 8px 0; color: #2d3748; }
        ul, ol { margin: 8px 0; padding-left: 26px; }
        li { margin: 6px 0; }
        .data-cards { display: flex; flex-wrap: wrap; gap: 15px; margin: 12px 0 18px; }
        .data-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px; border-radius: 8px; flex: 1; min-width: 150px; text-align: center; }
        .data-card .value { font-size: 2em; font-weight: bold; margin: 8px 0; }
        .data-card .label { font-size: 0.9em; }
        .data-card .trend { font-size: 0.85em; opacity: 0.9; margin-top: 4px; }
        .date { text-align: center; color: #718096; margin: 4px 0 18px; }
    </style>
</head>
<body>
    <h1>AI健身建议报告</h1>
    <p class="date">生成日期：${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    ${innerHTML.trim()}
    <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;">
    <p style="text-align: center; color: #a0aec0; font-size: 0.9em;">本报告由AI健身建议生成器自动生成</p>
</body>
</html>`;

        // 创建Blob
        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        // 下载文件
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `健身建议_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Word文档导出成功');
    } catch (error) {
        console.error('导出Word失败:', error);
        alert('导出失败：' + error.message);
    }
}

// 解析HTML为docx段落
function parseHTMLToDocx(html) {
    const { Paragraph, TextRun, HeadingLevel } = docx;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const paragraphs = [];
    const elements = tempDiv.children;

    for (let element of elements) {
        if (element.tagName === 'H3') {
            paragraphs.push(new Paragraph({
                text: element.textContent,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 240, after: 120 }
            }));
        } else if (element.tagName === 'P') {
            paragraphs.push(new Paragraph({
                text: element.textContent,
                spacing: { after: 120 }
            }));
        } else if (element.tagName === 'UL' || element.tagName === 'OL') {
            const items = element.getElementsByTagName('li');
            for (let item of items) {
                paragraphs.push(new Paragraph({
                    text: '• ' + item.textContent,
                    spacing: { after: 80 }
                }));
            }
        }
    }

    return paragraphs;
}

// 去除HTML标签
function stripHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 重置应用
function resetApp() {
    resultView.style.display = 'none';
    loadingView.style.display = 'none';
    uploadProgress.style.display = 'none';

    // 显示上传区域
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        uploadSection.style.display = 'block';
    }

    fitnessAdvice = '';
    currentFile = null;
    fileInput.value = '';

    // 清除图表
    chartInstances.forEach(chart => chart.destroy());
    chartInstances = [];
}

// 存储图表实例
let chartInstances = [];

// 初始化图表
function initCharts() {
    // 检查Chart.js是否加载
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js未加载');
        return;
    }

    // 如果没有 AI 指标，则不绘制图表，避免使用假数据
    if (!aiMetrics) {
        console.warn('AI 指标为空，跳过图表绘制');
        return;
    }

    // 清除旧图表
    chartInstances.forEach(chart => chart.destroy());
    chartInstances = [];

    const m = aiMetrics;

    // 体重变化预测图表（基于 weeklyWeight）
    const weightCanvas = document.getElementById('weightChart');
    if (weightCanvas && Array.isArray(m.weeklyWeight)) {
        const weightData = m.weeklyWeight
            .slice(0, 8)
            .map(v => Number(v))
            .filter(v => !Number.isNaN(v));

        if (weightData.length > 1) {
            const labels = weightData.map((_, idx) => `第${idx + 1}周`);
            const minVal = Math.min(...weightData);
            const maxVal = Math.max(...weightData);
            const padding = (maxVal - minVal) * 0.2 || 1;

            const weightChart = new Chart(weightCanvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: '体重 (kg)',
                        data: weightData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#667eea'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: { size: 12 },
                                padding: 10
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: minVal - padding,
                            max: maxVal + padding,
                            ticks: {
                                font: { size: 11 }
                            }
                        },
                        x: {
                            ticks: {
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });
            chartInstances.push(weightChart);
        }
    }

    // 肌肉群发展评估雷达图（基于 muscleCurrent / muscleTarget）
    const muscleCanvas = document.getElementById('muscleChart');
    if (muscleCanvas && m.muscleCurrent && m.muscleTarget) {
        const labels = ['胸肌', '背肌', '腿部', '核心', '手臂', '肩部'];
        const keyMap = ['chest', 'back', 'legs', 'core', 'arms', 'shoulders'];
        const currentData = keyMap.map(k => Number(m.muscleCurrent[k] ?? 0));
        const targetData = keyMap.map(k => Number(m.muscleTarget[k] ?? 0));

        const muscleChart = new Chart(muscleCanvas, {
            type: 'radar',
            data: {
                labels,
                datasets: [{
                    label: '当前水平',
                    data: currentData,
                    borderColor: '#fc8181',
                    backgroundColor: 'rgba(252, 129, 129, 0.3)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#fc8181'
                }, {
                    label: '目标水平',
                    data: targetData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.3)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 12 },
                            padding: 10
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            font: { size: 11 }
                        },
                        pointLabels: {
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
        chartInstances.push(muscleChart);
    }

    // 训练强度分布柱状图（基于 weeklyStrengthMinutes / weeklyCardioMinutes）
    const intensityCanvas = document.getElementById('intensityChart');
    if (
        intensityCanvas &&
        Array.isArray(m.weeklyStrengthMinutes) &&
        Array.isArray(m.weeklyCardioMinutes)
    ) {
        const strengthData = m.weeklyStrengthMinutes.slice(0, 7).map(v => Number(v) || 0);
        const cardioData = m.weeklyCardioMinutes.slice(0, 7).map(v => Number(v) || 0);
        const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

        const intensityChart = new Chart(intensityCanvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '力量训练 (分钟)',
                    data: strengthData,
                    backgroundColor: '#667eea',
                    borderWidth: 0
                }, {
                    label: '有氧运动 (分钟)',
                    data: cardioData,
                    backgroundColor: '#764ba2',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 12 },
                            padding: 10
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            font: { size: 11 }
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
        chartInstances.push(intensityChart);
    }

    // 营养摄入配比饼图（基于 nutritionRatio）
    const nutritionCanvas = document.getElementById('nutritionChart');
    if (nutritionCanvas && m.nutritionRatio) {
        const protein = Number(m.nutritionRatio.protein ?? 0);
        const carb = Number(m.nutritionRatio.carb ?? 0);
        const fat = Number(m.nutritionRatio.fat ?? 0);
        const total = protein + carb + fat;

        if (total > 0) {
            const normProtein = (protein / total) * 100;
            const normCarb = (carb / total) * 100;
            const normFat = (fat / total) * 100;

            const data = [normProtein, normCarb, normFat].map(v => Number(v.toFixed(1)));
            const labels = [
                `蛋白质 ${data[0]}%`,
                `碳水化合物 ${data[1]}%`,
                `脂肪 ${data[2]}%`
            ];

            const nutritionChart = new Chart(nutritionCanvas, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: [
                            '#667eea',
                            '#764ba2',
                            '#fc8181'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { size: 12 },
                                padding: 15
                            }
                        }
                    }
                }
            });
            chartInstances.push(nutritionChart);
        }
    }

    console.log(`已初始化 ${chartInstances.length} 个图表`);
}
