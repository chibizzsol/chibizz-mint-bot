const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const COLLECTION_ADDRESS = process.env.COLLECTION_ADDRESS;

const bot = new TelegramBot(BOT_TOKEN);

// Função para checar mints recentes
async function checkMints() {
  try {
    const url = `https://api.helius.xyz/v0/addresses/${COLLECTION_ADDRESS}/nfts?api-key=${HELIUS_API_KEY}`;

    const response = await axios.get(url);
    const nfts = response.data;

    for (const nft of nfts) {
      if (!nft.notified) {
        const message = `Novo mint detectado na coleção Chibizz! 🎉\nMint Address: ${nft.mint}`;
        await bot.sendMessage(CHAT_ID, message);
        nft.notified = true;
      }
    }
  } catch (error) {
    console.error('Erro ao buscar mints:', error.message);
  }
}

// Roda a cada 30 segundos
setInterval(checkMints, 30000);

console.log('Bot rodando e monitorando novos mints...');
