import { Client } from '@line/bot-sdk';
import express from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// 載入環境變數
dotenv.config();

// 初始化 LINE Bot 客戶端
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const lineClient = new Client(lineConfig);

// 初始化 OpenAI 客戶端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 創建 Express 應用
const app = express();

// 設定 webhook 路由
app.post('/webhook', express.json(), async (req, res) => {
  const events = req.body.events;

  // 處理每一個事件
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;  // 用戶發送的訊息
      const replyToken = event.replyToken;    // 用於回覆的 token

      // 呼叫 OpenAI API 生成回應
      try {
        const openAIResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',  // 使用 GPT-3.5 模型
          messages: [
            { role: 'system', content: '你是個友善的助手。' },  // 系統訊息
            { role: 'user', content: userMessage },  // 用戶的訊息
          ],
        });

        // 獲取回應訊息
        const botReply = openAIResponse.choices[0].message.content;

        // 回覆 LINE 用戶
        await lineClient.replyMessage(replyToken, {
          type: 'text',
          text: botReply,
        });
      } catch (error) {
        console.error('Error from OpenAI:', error);

        // 發送錯誤訊息給用戶
        await lineClient.replyMessage(replyToken, {
          type: 'text',
          text: '抱歉，出現錯誤，請稍後再試。',
        });
      }
    }
  }

  // 回應 LINE 平台的請求
  res.status(200).send('OK');
});

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
