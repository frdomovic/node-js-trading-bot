require("dotenv").config();
const ccxt = require("ccxt");

const apiUrlHist = `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&interval=daily&days=7&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
const apiUrlPrice = `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;

const exchange = new ccxt.binance({
    apiKey: process.env.BINANCE_API_KEY,
    secret: process.env.BINANCE_API_SECRET
});

const symbol = "SOL/USDT";
const type = "limit";
const side = "buy";
const amount = 0.1;

const run = async () => {
  let res, resJson;

  res = await fetch(apiUrlHist, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  resJson = await res.json();
  resJson.prices.pop();
  const average =
    resJson.prices.reduce((sum, el) => sum + el[1], 0) / resJson.prices.length;

  res = await fetch(apiUrlPrice, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  resJson = await res.json();
  const currentPrice = resJson.solana.usd;
  
  if (currentPrice > average) {
    const limitPrice = currentPrice * 1.02;
    const params = {
        stopLoss: {
            triggerPrice: currentPrice * 0.9
        },
        takeProfit: {
            triggerPrice: currentPrice * 1.3
        }
    };
    const order = await exchange.createOrder(symbol, type, side, amount, limitPrice, params);
    console.log(`Buy order created ${amount} - Limit @ ${limitPrice} - Take profit @ ${params.takeProfit} - Stop loss @ ${params.stopLoss}`);
    console.log(order);
  }
};

const init = setInterval(run, 86400 * 1000);