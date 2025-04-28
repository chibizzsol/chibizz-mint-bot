const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(BOT_TOKEN);

// Quando a Helius mandar um POST pro nosso servidor
app.post('/', async (req, res) => {
  try {
    const event = req.body[0]; // a Helius manda os eventos em lista
    if (event && event.type === 'NFT_MINT') {
      const mintAddress = event.nftMint;
      const message = `Novo mint detectado na coleção Chibizz! 🎉\nMint Address: ${mintAddress}`;
      await bot.sendMessage(CHAT_ID, message);
      console.log('Mint detectado e mensagem enviada:', mintAddress);
    }
    res.status(200).send('ok');
  } catch (error) {
    console.error('Erro ao processar webhook:', error.message);
    res.status(500).send('error');
  }
});

// O Render precisa que a gente escute uma porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot rodando e aguardando webhooks na porta ${PORT}...`);
});
