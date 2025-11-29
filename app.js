// AI 互动小说生成器 - 主应用逻辑

class InteractiveStory {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.storyHistory = [];
        this.currentGenre = '';
        this.chapterCount = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkApiKey();
    }

    setupEventListeners() {
        // API Key 相关
        document.getElementById('save-api-key').addEventListener('click', () => this.saveApiKey());
        document.getElementById('api-key-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });

        // 类型选择按钮
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const genre = e.target.dataset.genre;
                this.startStory(genre);
            });
        });

        // 自定义开始按钮
        document.getElementById('start-custom').addEventListener('click', () => {
            const customPrompt = document.getElementById('custom-prompt').value.trim();
            if (customPrompt) {
                this.startStory('自定义', customPrompt);
            } else {
                alert('请输入自定义的故事开局！');
            }
        });

        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    checkApiKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiStatus = document.getElementById('api-status');
        
        if (this.apiKey) {
            apiKeyInput.value = this.apiKey;
            apiStatus.textContent = '✓ API Key 已保存';
            apiStatus.className = 'api-status success';
        } else {
            apiStatus.textContent = '请先配置 API Key';
            apiStatus.className = 'api-status error';
        }
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiStatus = document.getElementById('api-status');
        const key = apiKeyInput.value.trim();

        if (key) {
            this.apiKey = key;
            localStorage.setItem('openai_api_key', key);
            apiStatus.textContent = '✓ API Key 已保存成功！';
            apiStatus.className = 'api-status success';
        } else {
            apiStatus.textContent = '✗ 请输入有效的 API Key';
            apiStatus.className = 'api-status error';
        }
    }

    async startStory(genre, customPrompt = null) {
        if (!this.apiKey) {
            alert('请先配置 OpenAI API Key！');
            return;
        }

        this.currentGenre = genre;
        this.storyHistory = [];
        this.chapterCount = 1;

        // 切换到故事界面
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('story-screen').classList.add('active');

        // 更新界面
        document.getElementById('story-genre').textContent = genre;
        document.getElementById('chapter-count').textContent = `第 ${this.chapterCount} 章`;
        document.getElementById('story-content').innerHTML = '';

        // 生成初始故事
        const initialPrompt = customPrompt || this.getGenrePrompt(genre);
        await this.generateStory(initialPrompt, true);
    }

    getGenrePrompt(genre) {
        const prompts = {
            '科幻': '你是一名星际探险家，刚刚接到一个神秘的任务信号，来自一颗未知的星球。',
            '奇幻': '你在一个古老的图书馆中发现了一本会说话的魔法书，它告诉你，你是被预言选中的人。',
            '悬疑': '深夜，你接到一个陌生电话，对方说："我知道你的秘密。" 然后挂断了。',
            '浪漫': '在一个下着小雨的午后，你在咖啡馆遇到了一个让你心动的陌生人。',
            '恐怖': '你搬进了一栋老房子，第一晚就听到了来自阁楼的奇怪声音。',
            '武侠': '你在江湖中闯荡多年，今日终于得到了一份神秘的武林秘籍。'
        };
        return prompts[genre] || prompts['科幻'];
    }

    async generateStory(userChoice, isFirstChapter = false) {
        this.showLoading(true);

        try {
            // 构建对话历史
            const messages = this.buildMessages(userChoice, isFirstChapter);

            // 调用 OpenAI API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: messages,
                    temperature: 0.8,
                    max_tokens: 800
                })
            });

            if (!response.ok) {
                throw new Error(`API 请求失败: ${response.status}`);
            }

            const data = await response.json();
            const storyContent = data.choices[0].message.content;

            // 解析故事和选择
            const parsed = this.parseStoryResponse(storyContent);

            // 添加到历史
            this.storyHistory.push({
                userChoice: userChoice,
                story: parsed.story,
                choices: parsed.choices
            });

            // 显示故事
            await this.displayStory(parsed.story);

            // 显示选择
            this.displayChoices(parsed.choices);

            this.showLoading(false);

        } catch (error) {
            console.error('生成故事时出错:', error);
            this.showLoading(false);
            alert('生成故事时出错，请检查 API Key 或网络连接。错误信息: ' + error.message);
        }
    }

    buildMessages(userChoice, isFirstChapter) {
        const systemPrompt = `你是一个专业的互动小说作家。你的任务是根据用户的选择，创作引人入胜的故事情节。

规则：
1. 每次生成 200-300 字的故事段落
2. 故事要有画面感、情节紧凑、引人入胜
3. 在故事结尾提供 2-3 个不同的选择，让用户决定下一步
4. 选择要有明显的不同方向，让用户感觉自己真正在影响故事走向
5. 保持故事的连贯性，记住之前的情节

输出格式（严格遵守）：
[故事]
这里是故事内容...
[选择]
1. 第一个选择
2. 第二个选择
3. 第三个选择（可选）`;

        const messages = [{ role: 'system', content: systemPrompt }];

        if (isFirstChapter) {
            messages.push({
                role: 'user',
                content: `开始一个${this.currentGenre}类型的故事。开局：${userChoice}`
            });
        } else {
            // 添加故事历史（最近3个）
            const recentHistory = this.storyHistory.slice(-3);
            let historyText = '之前的故事：\n';
            recentHistory.forEach((item, index) => {
                historyText += `\n${index + 1}. 用户选择：${item.userChoice}\n故事：${item.story}\n`;
            });

            messages.push({
                role: 'user',
                content: `${historyText}\n\n现在用户选择了：${userChoice}\n\n请继续故事。`
            });
        }

        return messages;
    }

    parseStoryResponse(content) {
        // 解析 AI 返回的内容
        const storyMatch = content.match(/\[故事\]([\s\S]*?)\[选择\]/);
        const choicesMatch = content.match(/\[选择\]([\s\S]*)/);

        let story = '';
        let choices = [];

        if (storyMatch) {
            story = storyMatch[1].trim();
        } else {
            // 如果没有标记，尝试分割
            const parts = content.split(/选择[:：]|你可以[:：]/i);
            story = parts[0].trim();
        }

        if (choicesMatch) {
            const choicesText = choicesMatch[1].trim();
            const lines = choicesText.split('\n').filter(line => line.trim());
            choices = lines.map(line => {
                return line.replace(/^\d+[.、]\s*/, '').trim();
            }).filter(choice => choice.length > 0);
        }

        // 如果没有找到选择，生成默认选择
        if (choices.length === 0) {
            choices = [
                '继续探索',
                '谨慎前进',
                '寻求帮助'
            ];
        }

        return { story, choices };
    }

    async displayStory(story) {
        const storyContent = document.getElementById('story-content');
        const paragraph = document.createElement('div');
        paragraph.className = 'story-paragraph';
        storyContent.appendChild(paragraph);

        // 打字机效果
        await this.typeWriter(paragraph, story, 30);

        // 滚动到底部
        storyContent.scrollTop = storyContent.scrollHeight;
    }

    typeWriter(element, text, speed) {
        return new Promise((resolve) => {
            let i = 0;
            element.textContent = '';

            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }

            type();
        });
    }

    displayChoices(choices) {
        const choicesContainer = document.getElementById('choices-container');
        choicesContainer.innerHTML = '';

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = `${index + 1}. ${choice}`;
            button.addEventListener('click', () => {
                this.chapterCount++;
                document.getElementById('chapter-count').textContent = `第 ${this.chapterCount} 章`;
                this.generateStory(choice);
            });
            choicesContainer.appendChild(button);
        });
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const choicesContainer = document.getElementById('choices-container');

        if (show) {
            loading.classList.remove('hidden');
            choicesContainer.innerHTML = '';
        } else {
            loading.classList.add('hidden');
        }
    }

    restart() {
        this.storyHistory = [];
        this.chapterCount = 1;
        document.getElementById('story-screen').classList.remove('active');
        document.getElementById('welcome-screen').classList.add('active');
        document.getElementById('custom-prompt').value = '';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveStory();
});
