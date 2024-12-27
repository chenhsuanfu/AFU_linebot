// 引入必要的套件
require('dotenv').config();  // 載入 .env 檔案中的環境變數
const express = require('express');
const line = require('@line/bot-sdk');
const { Configuration, OpenAIApi } = require('openai');

// 使用環境變數來讀取敏感資料
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const app = express();
const port = process.env.PORT || 3000;

// 初始化 LINE SDK 客戶端
const client = new line.Client(config);

// 初始化 OpenAI API 客戶端
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // 請確保在 .env 文件中設定 OPENAI_API_KEY
}));

// 設定 webhook 路由
app.post('/webhook', express.json(), async (req, res) => {
  const events = req.body.events;

  // 遍歷所有事件
  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      try {
        // 呼叫 OpenAI API 生成回應
        const aiResponse = await openai.createCompletion({
          model: 'text-davinci-003', // 可以選擇不同的模型，例如 text-davinci-003 或 gpt-4
          prompt: userMessage,
          max_tokens: 150,  // 控制生成回應的長度
          temperature: 0.7,  // 控制回應的創造性
        });

        const botReply = aiResponse.data.choices[0].text.trim();

        // 發送回覆訊息
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: botReply
        });
      } catch (err) {
        console.error('Error generating AI response:', err);
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '抱歉，發生了一些錯誤，請稍後再試。'
        });
      }
    }
  }

  res.status(200).send('OK');
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
