const ccxt = require('ccxt')

const binance = new ccxt.binance({
    'apiKey': process.env.KEY,
    'secret': process.env.SECRET,
    'timeout': 10000,
    'enableRateLimit': true,
    'options': {
        'recvWindow': 10000,
        'defaultType': 'future',
        'adjustForTimeDifference': true
    }
})

const symbols = {
    'BTC/USDT': 0.001,
    'BNB/USDT': 0.01
}

export default (req, res) => {
    var symbol = req.body
    console.log(req.body)
    res.status(200).json({res: "New order: "});
    return
    symbol = {
        "Symbol": "BTC/USDT",
        "Side": "buy",
        "Stop": 40000.00
    }

    binance.createOrder(symbol.Symbol, 'MARKET', symbol.Side, symbols[symbol.Symbol], undefined, {}).then(o=>{
        binance.createOrder(symbol.Symbol, 'TRAILING_STOP_MARKET', (symbol.Side == "buy" ? "sell" : "buy"), symbols[symbol.Symbol], undefined, {'callbackRate': 1.0, "reduceOnly": true}).then(t => {
            binance.createOrder(symbol.Symbol, 'STOP', (symbol.Side == "buy" ? "sell" : "buy"), symbols[symbol.Symbol], symbol.Stop * 2, {'stopPrice': symbol.Stop, "reduceOnly": true}).then(s => {
                res.status(200).json({res: "New order: " + symbol.Symbol});
            }).catch(e => {
                res.status(400).json({res: "e"})
            })
        }).catch(e => {
            binance.createOrder(symbol.Symbol, 'MARKET', (symbol.Side == "buy" ? "sell" : "buy"), symbols[symbol.Symbol], undefined, {"reduceOnly": true})
            res.status(400).json({res: "e"})
        })
    }).catch(e=>{res.status(400).json({res: "e"})})
}

async function test() {
    const localStartTime = Date.now()
    const {serverTime} = await binance.publicGetTime()
    const localFinishTime = Date.now()
    const estimatedLandingTime = (localFinishTime + localStartTime) / 2

    const diff = serverTime - estimatedLandingTime
    return diff;
}

async function fetchOrders() {
    binance.fetchOrders('BTC/USDT', undefined, undefined, {"recvWindow": 10000}).then(l => {
        res.status(200).json({res: l});
    })
}