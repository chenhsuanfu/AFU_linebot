// 引入必要的套件
require('dotenv').config();  // 載入 .env 檔案中的環境變數
const express = require('express');
const line = require('@line/bot-sdk');
const { OpenAI } = require('openai'); // 使用新的方式引入 OpenAI

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
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,  // 使用 API Key 來初始化 OpenAI 客戶端
});

// 設定 webhook 路由
app.post('/webhook', express.json(), (req, res) => {
  const events = req.body.events;

  // 遍歷所有事件
  events.forEach(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      // 發送回覆訊息
      try {
        // 呼叫 OpenAI API 生成流式回應
        const aiResponse = openai.chat.completions.create({
            model: 'gpt-4o-mini',  // 使用 GPT-3.5 模型
            messages: [{ role: 'user', content: userMessage }],
            stream: true,  // 啟用流式回應
          });

        // 建立一個變數來存儲訊息
        let botReply = '';

        // 監聽流式回應
        aiResponse.on('data', (data) => {
          const message = data.choices[0]?.delta?.content;
          if (message) {
            botReply += message;  // 不斷拼接訊息
          }
        });

        // 當流式回應完成時，發送最終回覆
        aiResponse.on('end', async () => {
          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: botReply.trim()  // 發送完整的回覆
          });
        });

        aiResponse.on('error', (err) => {
          console.error('Error with streaming:', err);
          client.replyMessage(event.replyToken, {
            type: 'text',
            text: '抱歉，發生了一些錯誤，請稍後再試。'
          });
        });

      } catch (err) {
        console.error('Error replying message:', err);
        await client.replyMessage(event.replyToken, {
            type: 'text',
            text: '抱歉，發生了一些錯誤，請稍後再試。'
          });
      }
    }
  });

  res.status(200).send('OK');
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
