const express = require('express');
const path = require('path');
const app = express();

// ═══ 配置改这里 ═══
const PASSWORD = 'sstw2024';        // ← 你和双双的密码
const API_KEY = 'sk-e77af443f5b14f4d88c8cd5451c4cb57';  // DeepSeek Key
const PORT = process.env.PORT || 3000;  // Railway 自动分配端口
// ═════════════════

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 登录验证
app.post('/api/login', (req, res) => {
  if (req.body.password === PASSWORD) {
    res.json({ success: true, token: 'ok' });
  } else {
    res.json({ success: false });
  }
});

// AI 聊天（只有带 token 才能用）
app.post('/api/chat', async (req, res) => {
  if (req.headers['x-auth-token'] !== 'ok') {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: req.body.messages || [],
        max_tokens: 2000,
        temperature: 0.8
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏠 双双的小窝 AI 服务器已启动！`);
  console.log(`📱 在浏览器打开: http://localhost:${PORT}`);
  console.log(`💡 局域网其他设备: http://你的IP:${PORT}`);
  console.log(`🔑 密码: ${PASSWORD}`);
});
