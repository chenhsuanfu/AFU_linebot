// 引入必要的套件
require('dotenv').config();  // 載入 .env 檔案中的環境變數
const express = require('express');
const line = require('@line/bot-sdk');

// 使用環境變數來讀取敏感資料
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const app = express();
const port = process.env.PORT || 3000;

// 初始化 LINE SDK 客戶端
const client = new line.Client(config);

// 設定 webhook 路由
app.post('/webhook', express.json(), (req, res) => {
  const events = req.body.events;

  // 遍歷所有事件
  events.forEach(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      // 發送回覆訊息
      try {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `你說的是: ${userMessage}`
        });
      } catch (err) {
        console.error('Error replying message:', err);
      }
    }
  });

  res.status(200).send('OK');
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
