// AI API 配置文件示例
// 复制此文件为 config.js 并填入您的实际API信息

const API_CONFIG = {
    // ==================== OpenAI 配置示例 ====================
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'sk-proj-your-api-key-here',
    model: 'gpt-4-vision-preview',
    
    // ==================== 通义千问 配置示例 ====================
    // endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
    // apiKey: 'sk-your-api-key-here',
    // model: 'qwen-vl-plus',
    
    // ==================== 文心一言 配置示例 ====================
    // endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
    // apiKey: 'your-api-key',
    // secretKey: 'your-secret-key',
    // model: 'ernie-bot-4',
    
    // ==================== 提示词模板 ====================
    promptTemplate: `请作为一名专业的健身教练，分析这张照片中的人物体态，并提供详细的健身建议。

请按以下格式输出（使用HTML格式）：

<h3>📊 体态分析</h3>
<p>分析照片中人物的体态特点，包括：</p>
<ul>
    <li>整体体型评估</li>
    <li>肌肉发展情况</li>
    <li>体态问题识别</li>
    <li>改善重点建议</li>
</ul>

<h3>💪 训练计划建议</h3>
<p><strong>第一阶段（1-4周）：基础力量训练</strong></p>
<ul>
    <li>周一、三、五：力量训练
        <ul>
            <li>具体动作和组数</li>
        </ul>
    </li>
    <li>周二、四、六：有氧运动
        <ul>
            <li>具体运动和时长</li>
        </ul>
    </li>
</ul>

<p><strong>第二阶段（5-8周）：进阶训练</strong></p>
<ul>
    <li>训练强度提升建议</li>
</ul>

<h3>🥗 饮食建议</h3>
<p><strong>营养配比：</strong></p>
<ul>
    <li>蛋白质摄入建议</li>
    <li>碳水化合物选择</li>
    <li>健康脂肪来源</li>
    <li>每日饮水量</li>
</ul>

<p><strong>饮食时间安排：</strong></p>
<ol>
    <li>早餐建议</li>
    <li>午餐建议</li>
    <li>晚餐建议</li>
    <li>加餐建议</li>
</ol>

<h3>⚠️ 注意事项</h3>
<ul>
    <li>训练前后注意事项</li>
    <li>安全提醒</li>
    <li>进度跟踪建议</li>
</ul>

<h3>🎯 预期效果</h3>
<p>坚持以上计划的预期效果：</p>
<ul>
    <li>体脂率变化</li>
    <li>肌肉增长</li>
    <li>体态改善</li>
    <li>整体健康提升</li>
</ul>

<p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
    <strong>💡 温馨提示：</strong>以上建议仅供参考，具体训练计划应根据个人实际情况调整。建议在开始新的训练计划前咨询专业健身教练或医生。
</p>

请确保建议专业、详细、可操作性强，并考虑安全因素。`
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

