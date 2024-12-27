// 引入 dotenv，並加載 .env 檔案中的變數
require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const bodyParser = require('body-parser');
const app = express();

const config = {
    channelAccessToken: process.env.Line_channelAccessToken,
    channelSecret: process.env.Line_channelSecret
};

const client = new line.Client(config);

// 設置 JSON body-parser 中介軟體
app.use(bodyParser.json());

// 設置 Webhook 路由
app.post('/webhook', line.middleware(config), (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
        .then(result => res.json(result))
        .catch(err => res.status(500).end());
});

// 處理事件：對文本訊息回應相同訊息
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const echo = { type: 'text', text: event.message.text };

    return client.replyMessage(event.replyToken, echo);
}

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
