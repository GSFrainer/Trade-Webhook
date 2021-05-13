const ccxt = require('ccxt')

const binance = new ccxt.binance({
    'apiKey': process.env.KEY,
    'secret': process.env.SECRET,
    'timeout': 10000,
    'enableRateLimit': true,
    'options':{
        'recvWindow':10000,
        'defaultType': 'future',
        'adjustForTimeDifference': true
    }
})

const symbols = {
    'BTC/USDT': 0.001,
    'BNB/USDT': 0.01
}

export default (req, res)=>{
    var symbol = req.query['symbol']
    console.log(symbol)

    if(!(symbol in symbols)){
        res.status(400).json({error:"Invalid symbol"});
        return;
    }

    res.status(200).json({res:"1"});
    return
    binance.createOrder('BTC/USDT', 'limit', 'buy', 0.001, 49000.00, {'stopPrice':48000.00}).then(r=>{
        res.status(200).json({res:r});
    })
}

async function test () {
    const localStartTime = Date.now ()
    const { serverTime } = await binance.publicGetTime ()
    const localFinishTime = Date.now ()
    const estimatedLandingTime = (localFinishTime + localStartTime) / 2

    const diff = serverTime - estimatedLandingTime
    return diff;
}

async function fetchOrders(){
    binance.fetchOrders('BTC/USDT', undefined, undefined, {"recvWindow":10000}).then(l=>{
        res.status(200).json({res:l});
    })
}