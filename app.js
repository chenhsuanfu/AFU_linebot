require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const { addTranslation, getTranslation } = require('./languageRecord'); // 引入外部的語言紀錄檔案

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const app = express();
const port = process.env.PORT || 3000;

const client = new line.Client(config);

app.post('/webhook', express.json(), (req, res) => {
  const events = req.body.events;

  events.forEach(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      // 檢查訊息是否包含 ';'，並進行處理
      if (userMessage.includes(';')) {
        const [word1, word2] = userMessage.split(';').map((word) => word.trim());
        addTranslation(word1, word2);  // 增加翻譯
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `已儲存: ${word1} => ${word2} 和 ${word2} => ${word1}`
        });
      } else {
        // 查找翻譯
        const translation = getTranslation(userMessage);
        if (translation) {
          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `${userMessage} 的對應詞是: ${translation}`
          });
        } else {
          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `抱歉，我沒有找到 ${userMessage} 的對應翻譯。`
          });
        }
      }
    }
  });

  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
