const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(BOT_TOKEN);

// Função para pegar metadata URI de um mint address
async function getMetadataUri(mintAddress) {
  try {
    const metadataUrl = `https://api.helius.xyz/v0/tokens/metadata?api-key=${process.env.HELIUS_API_KEY}`;
    const response = await axios.post(metadataUrl, {
      mintAccounts: [mintAddress]
    });

    const uri = response.data?.[0]?.offChainMetadataUri;
    return uri || null;
  } catch (error) {
    console.error('Error fetching metadata URI:', error.message);
    return null;
  }
}

// Função para pegar imagem do metadata URI
async function getImageFromUri(uri) {
  try {
    const response = await axios.get(uri);
    return response.data?.image || null;
  } catch (error) {
    console.error('Error fetching image from metadata URI:', error.message);
    return null;
  }
}

// Quando receber um webhook da Helius
app.post('/', async (req, res) => {
  try {
    const event = req.body[0];

    if (event && event.type === 'NFT_MINT') {
      const mintAddress = event.nftMint;

      // Buscar metadata e imagem
      const metadataUri = await getMetadataUri(mintAddress);
      const imageUrl = metadataUri ? await getImageFromUri(metadataUri) : null;

      if (imageUrl) {
        await bot.sendPhoto(CHAT_ID, imageUrl, {
          caption: `New mint detected! 🎉\n\nMint Address: ${mintAddress}\nView on Solscan: https://solscan.io/token/${mintAddress}`
        });
        console.log('Mint detected and image sent:', mintAddress);
      } else {
        // Se não conseguir puxar imagem, mandar texto normal
        await bot.sendMessage(CHAT_ID, `New mint detected! 🎉\n\nMint Address: ${mintAddress}\nView on Solscan: https://solscan.io/token/${mintAddress}`);
        console.log('Mint detected but no image found:', mintAddress);
      }
    }

    res.status(200).send('ok');
  } catch (error) {
    console.error('Error handling webhook:', error.message);
    res.status(500).send('error');
  }
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot running and listening for webhooks on port ${PORT}...`);
});
