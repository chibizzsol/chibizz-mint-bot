const TelegramBot = require('node-telegram-bot-api');
const { Connection } = require('@solana/web3.js');
const { Webhook } = require('@helius-labs/webhooks');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const COLLECTION_ADDRESS = process.env.COLLECTION_ADDRESS;

const bot = new TelegramBot(BOT_TOKEN);

const connection = new Connection(`https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`);

async function listenMints() {
  const webhook = new Webhook({
    connection,
    apiKey: HELIUS_API_KEY,
    webhookUrl: 'https://your-webhook-url.com',
    webhookType: 'NFT_COLLECTION_MINT',
    webhookEvents: [
      { collectionId: COLLECTION_ADDRESS, compressed: false },
      { collectionId: COLLECTION_ADDRESS, compressed: true }
    ],
  });

  webhook.on('event', async (event) => {
    const mintAddress = event.nftMintAddress;
    const message = `Novo mint detectado na coleção Chibizz! 🎉\nMint Address: ${mintAddress}`;
    await bot.sendMessage(CHAT_ID, message);
  });

  console.log('Bot rodando e escutando novos mints...');
}

listenMints();
