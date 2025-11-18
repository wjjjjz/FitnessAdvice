// AI API 配置文件
// 请根据您使用的AI服务提供商修改以下配置

const API_CONFIG = {
    // API端点 - 请替换为您的实际API地址
    // 示例：
    // - OpenAI: 'https://api.openai.com/v1/chat/completions'
    // - 通义千问: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    // - 文心一言: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions'
    endpoint: '',

    // API密钥 - 请替换为您的实际API密钥
    apiKey: '',

    // 模型名称
    model: '', // 或其他支持图像分析的模型

    // 最大输出token数（用于控制回复长度，可按需调大或调小）
    maxTokens: 6000,

    // 提示词模板
    promptTemplate: `请作为一名专业的健身教练，分析这张照片中的人物体态，并提供详细的健身建议。

重要要求（务必严格遵守）：
1. 你只需要生成“文字内容”的 HTML 片段，从下面这些 <h3> 标题开始输出，不要生成 <html>、<head>、<body> 等标签。
2. 不要输出任何 <script>、<style>、<canvas>、<svg> 等标签。
3. 不要输出任何与图表或数据卡片相关的结构（例如 class="data-cards"、class="charts-section"、id="weightChart" 等），图表和数据卡片由前端页面自动添加。
4. 所有内容请使用中文，语气专业、具体、可执行。
5. 在输出下面的 HTML 内容之前，请先输出一行 HTML 注释，里面只包含一段 JSON 数据，用于前端绘制数据卡片和图表，格式必须严格类似：
   <!--DATA: {"bmi": 22.5, "bmiStatus": "标准范围", "bodyFat": 18, "bodyFatStatus": "健康水平", "targetBodyFat": 15, "targetBodyFatDesc": "8周可达", "trainingIntensityLevel": "中等", "trainingIntensityTrend": "逐步提升", "weeklyWeight": [70, 69.5, 69, 68.3, 67.8, 67.2, 66.8, 66.5], "muscleCurrent": {"chest": 65, "back": 60, "legs": 70, "core": 55, "arms": 62, "shoulders": 58}, "muscleTarget": {"chest": 80, "back": 78, "legs": 85, "core": 75, "arms": 78, "shoulders": 75}, "weeklyStrengthMinutes": [45, 0, 45, 0, 45, 0, 0], "weeklyCardioMinutes": [0, 30, 0, 30, 0, 30, 0], "nutritionRatio": {"protein": 30, "carb": 45, "fat": 25}} -->
6. JSON 字段说明（字段名必须使用英文，数值尽量用数字）：
   - bmi: 当前估算 BMI 数值，保留 1 位小数；
   - bmiStatus: 对 BMI 的简短评价，例如“偏高”、“标准范围”等；
   - bodyFat: 体脂率估算（百分比，0-100）；
   - bodyFatStatus: 对体脂的简短评价；
   - targetBodyFat: 建议的目标体脂率（百分比）；
   - targetBodyFatDesc: 关于目标体脂的简短描述，例如“8周可达”、“中长期目标”等；
   - trainingIntensityLevel: 整体训练强度等级，例如“偏低”“中等”“偏高”等；
   - trainingIntensityTrend: 对训练强度变化的提醒，例如“逐步提升”、“注意避免过度训练”等；
   - weeklyWeight: 长度为 8 的数组，表示未来 8 周体重变化预测（单位 kg）；
   - muscleCurrent: 对象，键为 chest、back、legs、core、arms、shoulders，对应当前各肌群发展水平（0-100 分）；
   - muscleTarget: 同上，对应目标水平（0-100 分）；
   - weeklyStrengthMinutes: 长度为 7 的数组，对应周一到周日每天力量训练时间（分钟）；
   - weeklyCardioMinutes: 长度为 7 的数组，对应周一到周日每天有氧训练时间（分钟）；
   - nutritionRatio: 对象，包含 protein、carb、fat 三个键，表示营养摄入比例百分比（总和约为 100）。
7. 请不要在 JSON 注释前后输出任何多余的文字或说明，注释后直接换行并开始输出下面规定结构的 HTML 内容。



请严格按下面的结构输出，可以在每一部分写得更长、更详细：

<h3>📊 体态分析</h3>
<p>分析照片中人物的体态特点，例如：肩膀是否前倾、骨盆是否前倾或后倾、是否存在驼背/含胸、肌肉发展是否均衡等。</p>
<ul>
    <li>整体体态评价</li>
    <li>主要问题或需要改善的部位</li>
    <li>对日常姿势和习惯的影响</li>
</ul>

<h3>💪 训练计划建议</h3>
<p>给出详细训练方案，按周期说明（例如基础期/强化期），并包含每周训练频率、力量训练与有氧训练的安排。</p>
<ul>
    <li>每周训练次数与整体安排</li>
    <li>推荐的主要训练动作（可分上肢、下肢、核心）及组数、次数或时间</li>
    <li>训练强度与递进建议（例如何时增加重量或时间）</li>
</ul>

<h3>🥗 饮食建议</h3>
<p>说明整体饮食原则，并结合减脂/增肌目标给出蛋白质、碳水化合物和脂肪的大致比例和来源建议。</p>
<ul>
    <li>一天中三餐和加餐的大致搭配建议</li>
    <li>适合的食物类型与不建议过量摄入的食物</li>
    <li>饮水和作息方面与饮食相关的注意点</li>
</ul>

<h3>⚠️ 注意事项</h3>
<ul>
    <li>训练前后需要注意的准备和放松（如热身、拉伸）</li>
    <li>可能存在的受伤风险与避免方法</li>
    <li>在什么情况下应该减少训练量或及时就医</li>
</ul>

<h3>🎯 预期效果</h3>
<p>结合当前状态，描述在坚持执行 8~12 周后，体型、体态、力量和精神状态等方面可能出现的积极变化。</p>
<ul>
    <li>体态和外形方面的改善</li>
    <li>力量和体能方面的提升</li>
    <li>生活状态或精神状态的正向变化</li>
</ul>

请确保建议专业、详细、可操作性强。`
,

    // 精简模式提示词模板（输出更短、更概括的文字版报告）
    compactPromptTemplate: `请作为一名专业的健身教练，在“精简模式”下分析这张照片中的人物体态，并输出较短、概括性的健身建议。

重要要求（务必严格遵守）：
1. 你只需要生成“文字内容”的 HTML 片段，从下面这些 <h3> 标题开始输出，不要生成 <html>、<head>、<body> 等标签。
2. 不要输出任何 <script>、<style>、<canvas>、<svg> 等标签。
3. 不要输出任何与图表或数据卡片相关的结构（例如 class="data-cards"、class="charts-section"、id="weightChart" 等），图表和数据卡片由前端页面自动添加。
4. 所有内容请使用中文，语气简明、专业、可执行。
5. 精简模式下，每个部分请控制在 3~5 条要点以内，总体字数明显少于普通模式。
6. 在输出下面的 HTML 内容之前，请先输出一行 HTML 注释，里面只包含一段 JSON 数据，用于前端绘制数据卡片和图表，格式必须严格类似：
   <!--DATA: {"bmi": 22.5, "bmiStatus": "标准范围", "bodyFat": 18, "bodyFatStatus": "健康水平", "targetBodyFat": 15, "targetBodyFatDesc": "8周可达", "trainingIntensityLevel": "中等", "trainingIntensityTrend": "逐步提升", "weeklyWeight": [70, 69.5, 69, 68.3, 67.8, 67.2, 66.8, 66.5], "muscleCurrent": {"chest": 65, "back": 60, "legs": 70, "core": 55, "arms": 62, "shoulders": 58}, "muscleTarget": {"chest": 80, "back": 78, "legs": 85, "core": 75, "arms": 78, "shoulders": 75}, "weeklyStrengthMinutes": [45, 0, 45, 0, 45, 0, 0], "weeklyCardioMinutes": [0, 30, 0, 30, 0, 30, 0], "nutritionRatio": {"protein": 30, "carb": 45, "fat": 25}} -->
7. JSON 字段说明（字段名必须使用英文，数值尽量用数字）：
   - bmi: 当前估算 BMI 数值，保留 1 位小数；
   - bmiStatus: 对 BMI 的简短评价，例如“偏高”、“标准范围”等；
   - bodyFat: 体脂率估算（百分比，0-100）；
   - bodyFatStatus: 对体脂的简短评价；
   - targetBodyFat: 建议的目标体脂率（百分比）；
   - targetBodyFatDesc: 关于目标体脂的简短描述，例如“8周可达”、“中长期目标”等；
   - trainingIntensityLevel: 整体训练强度等级，例如“偏低”“中等”“偏高”等；
   - trainingIntensityTrend: 对训练强度变化的提醒，例如“逐步提升”、“注意避免过度训练”等；
   - weeklyWeight: 长度为 8 的数组，表示未来 8 周体重变化预测（单位 kg）；
   - muscleCurrent: 对象，键为 chest、back、legs、core、arms、shoulders，对应当前各肌群发展水平（0-100 分）；
   - muscleTarget: 同上，对应目标水平（0-100 分）；
   - weeklyStrengthMinutes: 长度为 7 的数组，对应周一到周日每天力量训练时间（分钟）；
   - weeklyCardioMinutes: 长度为 7 的数组，对应周一到周日每天有氧训练时间（分钟）；
   - nutritionRatio: 对象，包含 protein、carb、fat 三个键，表示营养摄入比例百分比（总和约为 100）。
8. 请不要在 JSON 注释前后输出任何多余的文字或说明，注释后直接换行并开始输出下面规定结构的 HTML 内容。



请严格按下面的结构输出：

<h3>📊 体态与整体建议（精简版）</h3>
<ul>
    <li>用 1~2 句话概括整体体态评价。</li>
    <li>列出 1~2 个需要重点改善的部位。</li>
</ul>

<h3>💪 训练要点（精简版）</h3>
<ul>
    <li>给出每周大致训练频率和类型（力量 + 有氧）。</li>
    <li>列出 2~3 个核心训练动作或训练要点。</li>
</ul>

<h3>🥗 饮食与生活（精简版）</h3>
<ul>
    <li>简要说明饮食的整体原则（偏减脂或偏增肌）。</li>
    <li>给出 2~3 条最重要的饮食/作息建议。</li>
</ul>

请确保内容简洁、有重点，适合作为快速浏览的文字版总结。`

};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

