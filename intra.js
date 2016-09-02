var request = require('request');
var flatten = require('flat');
var n = require('nonce')();

//Objects Definition
var myDB = {};

// xchngfees ['name', maker, taker]
xchngfees = [
	['btce', 0.002, 0.002],
	['polo', 0.0015, 0.0025],
	['kraken', 0.0016, 0.0026],
	['finex', 0.001, 0.002],
	['bittrex', 0.0025, 0.0025]
];

fees = {};

function setFees(){
	xchngfees.forEach(function(params){
		var xchg = params[0];
		fees[xchg] = {};
		fees[xchg]['m'] = params[1];
		fees[xchg]['t'] = params[2];
	})

}

//Poloniex Definitions
var Poloniex = require('poloniex.js');
Poloniex.STRICT_SSL = false;
var poloniex = new Poloniex('WCPO2NDL-1K08IB7D-FUP12VOM-B3FJ0PHN', '6ad5e7890ab16dff8556a4f6ce1f6646f98b638c62df0767a494c259b58f1137aaf1ce97a69c49fd3a3e11f8390dff5a66ff73eace68d3d785af0ee23e6fc3e1');

//BTC-e Definitions
var BTCE = require('btce-deal');
var btcePublic = new BTCE.Public(),
	btceTrade = new BTCE.Trade('6APEFI9K-I7ODZGB8-SHWLX78Y-RY4LK4Y9-UAOMLVXZ', 'f587d4b73e1a0ceab01a022ef61bb571f262a28a87767ef36ad97c0626c25221');

//Bitfinex Definitions
var Bitfinex = require('bitfinex');
var bitfinex = new Bitfinex('MxjWdpYoPjSswC5iCZ3zAvfgyOqd7n92EgoCv7DoIyM', 'JhRWzsgbUJpWRG9Nu2bnBmwIKodHs1qcOFcu6BpOOZx');

//Kraken Definitions
var KrakenClient = require('kraken-api');
var kraken = new KrakenClient('8Gz3Yhqj0O9T9WLSyjt2NdbOdadP0P+uYmUi9F3nf4oqA3ur8OdAByKm', 'AMQ6uJc5/w6Eil2PY48P/MfDdtZOYkVeXVjwx+nY82BXIOUxHevO8gm7fzxvq7W792CGCPKOCyWcKD8H8J+jxA==');

//Bittrex Definition
var bittrex = require('node.bittrex.api');
bittrex.options({
    'apikey' : 'd1ddaed4ae4242e1a109bca166abd932',
    'apisecret' : 'db8a7600ebfa489fa749a1bb7e15f687', 
    'stream' : false,
    'verbose' : false,
    'cleartext' : false 
});



// 
// POLONIEX FUNCITONS
//


function poloTicker(){
	poloniex.getTicker(function(err, data){

		if (err){
			console.log(err);
		}
		for (var i in data) {
			if (data[i].baseVolume > 20) {
			var xchg = 'polo';
			var xpair = i;
			var low = i.toLowerCase();
			var pairs = low.split("_");
			// polo brings apis pairs with btc,xmr,eth + crypto
			var spair = pairs[1] + pairs[0];
			var objID = xchg + spair;
			myDB[objID] = {};
			myDB[objID]['xchg'] = xchg;
			myDB[objID]['pair'] = spair;
			myDB[objID]['xpair'] = xpair;
			myDB[objID]['pairs'] = pairs;
			myDB[objID]['bid'] =  data[i].highestBid;
			myDB[objID]['ask'] = data[i].lowestAsk;
			myDB[objID]['last'] = data[i].last;
			myDB[objID]['vol'] = data[i].baseVolume;
			}
		}  
	});
}


// 
// BTCE FUNCTIONS
//

function btceTicker(){
	var pairs = ['eth_btc', 'ltc_btc', 'eth_ltc', 'nmc_btc', 'ppc_btc', 'nvc_btc'];


	btcePublic.getTicker(pairs)
	.then(function (data) {
		for (var i in data) {
			var xchg = 'btce';
			var xpair = i;
			var pairs = xpair.split("_");
			var spair = pairs[0] + pairs[1];
			var objID = xchg + spair;
			myDB[objID] = {};
			myDB[objID]['xchg'] = xchg;
			myDB[objID]['pair'] = spair;
			myDB[objID]['xpair'] = xpair;
			myDB[objID]['pairs'] = pairs;
			myDB[objID]['bid'] =  data[i].sell;
			myDB[objID]['ask'] = data[i].buy;
			myDB[objID]['last'] = data[i].last;
			myDB[objID]['vol'] = data[i].vol_cur;
		}
	})    
	.error(function (data) {
	});
}

// BITFINEX FUNCTIONS

function finexTicker(){
	var pairs = ['ETHBTC','LTCBTC']

	pairs.forEach(function(pair){
		bitfinex.ticker(pair, 
		function(err, res){
			if (err) {
				console.log(err);
			}else{
				var xchg = 'finex';
				var low = pair.toLowerCase();
				var apair = low.slice(0, 3);
				var bpair = low.slice(3, 6);
				var pairs = [apair, bpair];
				var objID = xchg + low;
				myDB[objID] = {};
				myDB[objID]['xchg'] = xchg;
				myDB[objID]['pair'] = low;
				myDB[objID]['xpair'] = pair;
				myDB[objID]['pairs'] = pairs;
				myDB[objID]['bid'] =  res.bid;
				myDB[objID]['ask'] = res.ask;
				myDB[objID]['last'] = res.last_price;
				myDB[objID]['vol'] = res.volume / res.last_price;
			}
		});
	})
}

//
//KRAKEN FUNCTIONS
//

function krakenTicker(){
	var pairs = ['XLTCXXBT', 'XXDGXXBT', 'XETHXXBT', 'XDAOXETH', 'XXRPXXBT', 'XDAOXXBT'];

	pairs.forEach(function(kkpair){
		kraken.api('Ticker', {"pair": kkpair}, function(error, data) {
			if(error) {
				console.log(error);
			}
			else {
			switch(kkpair){
				case 'XLTCXXBT':
					var spair = 'ltcbtc';
					break;
			case 'XXDGXXBT':
				var spair = 'dogebtc';
				break;
			case 'XETHXXBT':
				var spair = 'ethbtc';
				break;
			case 'XDAOXETH':
					var spair = 'daoeth';
					break;
			case 'XXRPXXBT':
				var spair = 'xrpbtc';
				break;
			case 'XDAOXXBT':
				var spair = 'daobtc';
			}
			var xchg = 'kraken';
			var apair = spair.slice(0, 3);
			var bpair = spair.slice(3, 6);
			var pairs = [apair, bpair];
			var objID = xchg + spair;
			myDB[objID] = {};
			myDB[objID]['xchg'] = xchg;
			myDB[objID]['pair'] = spair;
			myDB[objID]['xpair'] = kkpair;
			myDB[objID]['pairs'] = pairs;
			myDB[objID]['bid'] =  data.result[kkpair].b[0];
			myDB[objID]['ask'] = data.result[kkpair].a[0];
			myDB[objID]['last'] = data.result[kkpair].c[0];
			myDB[objID]['vol'] = data.result[kkpair].v[1] * data.result[kkpair].c[0];
			}
		});
	});

}

//
//BITTREX FUNCTIONS
//

function bittrexTicker(){
	bittrex.getmarketsummaries( function( data ) {
    	for( var i in data.result ) {
    		if(data.result[i].BaseVolume > 20){
    		var xchg = 'bittrex';
			var xpair = data.result[i].MarketName;
			var low = xpair.toLowerCase();
			var pairs = low.split("-");
			var spair = pairs[1] + pairs[0];
			var objID = xchg + spair;
			myDB[objID] = {};
			myDB[objID]['xchg'] = xchg;
			myDB[objID]['pair'] = spair;
			myDB[objID]['xpair'] = xpair;
			myDB[objID]['pairs'] = pairs;
			myDB[objID]['bid'] =  data.result[i].Bid;
			myDB[objID]['ask'] = data.result[i].Ask;
			myDB[objID]['last'] = data.result[i].Last;
			myDB[objID]['vol'] = data.result[i].BaseVolume;
    		}
    	}
	});
}

//Profits 
var intra = 0.01;
var mvol = 30;


//Comparing Prices

function compare(){
	for (var objID in myDB) {
		if (myDB[objID]['vol'] >= mvol) {
			var xchg =  myDB[objID]['xchg'];
			var pair =  myDB[objID]['pair'];
			var bid  = myDB[objID]['bid'];
			var last = myDB[objID]['last'];
			var ask = myDB[objID]['ask'];
			var mid = (ask+bid)/2;
			var mid2ask = ((1 - (ask * (1 - fees[xchg].t))/(mid * (1 + fees[xchg].t))));
			var mid2bid = ((1 - (bid * (1 - fees[xchg].t))/(mid * (1 + fees[xchg].t))))*-1;
			var mid2last = ((1 - (last * (1 - fees[xchg].t))/(mid * (1 + fees[xchg].t))));
			var bid2ask = ((1 - (bid * (1 - fees[xchg].t))/(ask * (1 + fees[xchg].t))));
			var ask2bid = ((1 - (ask * (1 - fees[xchg].t))/(bid * (1 + fees[xchg].t))));
			var ask2last = ((1 - (ask * (1 - fees[xchg].t))/(last * (1 + fees[xchg].t))));
			var bid2last = ((1 - (bid * (1 - fees[xchg].t))/(last * (1 + fees[xchg].t))));
			if (mid2ask > intra) {
				console.log('mid2ask @ '+pair+' @ '+xchg+' = '+ mid2ask);
			}
			if (mid2bid > intra) {
				console.log('mid2bid @ '+pair+' @ '+xchg+' = '+ mid2bid);
			}
			if (mid2last > intra) {
				console.log('mid2last @ '+pair+' @ '+xchg+' = '+ mid2last);
			}
			if (bid2ask > intra) {
				console.log('bid2ask @ '+pair+' @ '+xchg+' = '+ bid2ask);
			}
			if (ask2bid > intra) {
				console.log('ask2bid @ '+pair+' @ '+xchg+' = '+ ask2bid);
			}
			if (ask2last > intra) {
				console.log('ask2last @ '+pair+' @ '+xchg+' = '+ ask2last);
			}
			if (bid2last > intra) {
				console.log('bid2last @ '+pair+' @ '+xchg+' = '+ bid2last);
			}
		}
	}

}






//Running Parameters


setImmediate(function start(){
	setFees();
})

setInterval(function runGetData(){
	poloTicker();
	btceTicker();
	finexTicker();
	krakenTicker();
	bittrexTicker();
}, 10000)


setInterval(function runCompare(){
	compare();
	console.log("\n\n\n\n\n\n\n\n\n");
}, 10000)

