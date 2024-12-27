const express = require('express');
const line = require('@line/bot-sdk');
const bodyParser = require('body-parser');

const app = express();

// LINE Bot 配置
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// 初始化 LINE 客戶端
const client = new line.Client(config);

// 使用 body-parser
app.use(bodyParser.json());

// Webhook 路徑
app.post('/callback', line.middleware(config), (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
      .then(() => res.status(200).end()) // 如果處理成功，返回 200
      .catch(err => {
        console.error("處理事件時發生錯誤:", err);
        res.status(500).send('內部伺服器錯誤'); // 返回 500 並記錄錯誤
      });
  });

// 處理事件
function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const echo = { type: 'text', text: event.message.text };
    return client.replyMessage(event.replyToken, echo);
  }
  return Promise.resolve(null);
}

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
