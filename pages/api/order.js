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
    // symbol = JSON.parse('{  "Price": 0.11821,  "Stop": 0.11794,  "High": 0.11821,  "Low": 0.11794,  "Side": "BUY",  "Symbol": "BTC/USDT"}')
    // console.log(req.body)
    symbol.Side = symbol.Side.toLowerCase()
    // console.log(symbol['Price'])
    // console.log(symbol['Stop'])
    if(Number.isInteger(symbol['High']) && Number.isInteger(symbol['Low'])){
        symbol.Stop = parseInt(symbol.Stop) + (symbol.Side=='buy'?(parseInt(symbol.Low) - parseInt(symbol.High)):(parseInt(symbol.High) - parseInt(symbol.Low)))
    }else{
        symbol.Stop = parseFloat(symbol.Stop) + (symbol.Side=='buy'?(parseFloat(symbol.Low) - parseFloat(symbol.High)):(parseFloat(symbol.High) - parseFloat(symbol.Low)))
        symbol.Stop = symbol.Stop.toFixed((""+symbol.High).split('.')[1].length)
    }
    // console.log(symbol.Stop)
    // console.log(symbol['Side'])
    console.log(symbol)
    
    
    // binance.fetchBalance().then(a=>res.status(200).json({res: a['info']['positions'].find(a=>(a['symbol'] == symbol.Symbol.replace('/','') && a['entryPrice'] != 0.0))}))
    
    
    // binance.fetchBalance().then(a=>{
    //     var position = a['info']['positions'].find(a=>(a['symbol'] == symbol.Symbol.replace('/','') && a['entryPrice'] != 0.0))
    //     console.log(position)
    // })
    
    //binance.fetchOpenOrders ("BTC/USDT").then(a=>console.log(a))
    return res.status(200).json({res: "done"})

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