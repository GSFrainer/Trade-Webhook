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

//Request Body: {"Price":{{close}}, "Stop":{{low}}, "High":{{high}}, "Low":{{low}}, "Side":"BUY", "Symbol":"ADA/USDT"}
export default (req, res) => {
    var symbol = req.body
    symbol.Side = symbol.Side.toLowerCase()
    symbol.Stop = (symbol.Side=='buy'?(parseFloat(symbol.Price)*0.985):(parseFloat(symbol.Price)*1.015))
    if(Number.isInteger(symbol['High']) && Number.isInteger(symbol['Low'])){
        symbol.Stop = Math.trunc(symbol.Stop)
    }else{
        symbol.Stop = symbol.Stop.toFixed((""+symbol.Price).split('.')[1].length)
    }
    
    binance.fetchBalance().then(a=>{
        if(symbol.Quantity == undefined){
            symbol.Quantity = symbols[symbol.Symbol]
        }

        // -- Revert position side --
        // var position = a['info']['positions'].find(a=>(a['symbol'] == symbol.Symbol.replace('/','') && a['entryPrice'] != 0.0))
        // if(position != undefined){
        //     symbol.Quantity = symbol.Quantity*2
        // }

        binance.createOrder(symbol.Symbol, 'MARKET', symbol.Side, symbol.Quantity, undefined, {}).then(o=>{
            res.status(200).json({res: "New order: " + symbol.Symbol});

            // -- Stop Loss and Trailing Stop Orders --
            // binance.createOrder(symbol.Symbol, 'STOP', (symbol.Side == "buy" ? "sell" : "buy"), symbol.Quantity, symbol.Stop * 2, {'stopPrice': symbol.Stop, "reduceOnly": true}).then(s => {
            //     res.status(200).json({res: "New order: " + symbol.Symbol});
            // }).catch(e => {
            //     res.status(400).json({res: "e"})
            // })
            // }).catch(e => {
            //     //binance.createOrder(symbol.Symbol, 'MARKET', (symbol.Side == "buy" ? "sell" : "buy"), symbol.Quantity, undefined, {"reduceOnly": true})
            //     res.status(400).json({res: e})
            // })

        }).catch(e=>{
            console.log(e)
            res.status(400).json({res: e})
        })
    })   
}