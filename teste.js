var request = require('request');
var flatten = require('flat');
var n = require('nonce')();

//Objects Definition
var myDB = {};
var balance = {};


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
		balance[xchg] = {};
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
			console.log('ERRO POLO TICKER'+err);
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
			}
		}  
	});
}


function poloBal(){

	poloniex.myBalances(function(err, data){


	    if (err){
	        console.log('ERRO POLO BALANCE '+err);
	    }
	    for (var i in data){
	    	if (data[i] > 0) {
	    	var low = i.toLowerCase();
	    	balance.polo[low] = data[i];

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
		}
			// console.log(myDB);
	})    
	.error(function (data) {
		console.log('ERRO BTC TICKER' + data);
	});

}


function btceBal (){

	btceTrade.getInfo()
	.then(function (data) {
		var funds = data.funds;
		for (var i in funds){
			if (funds[i] > 0.001) {
			balance.btce[i] = funds[i];
			}

		} 
    })
    .error(function (data) {
        console.log('erro BTCE BALANCE: '+data);
    });


}


// BITFINEX FUNCTIONS

function finexTicker(){
	var pairs = ['ETHBTC', 'ETCBTC', 'LTCBTC']

	pairs.forEach(function(pair){
		bitfinex.ticker(pair, 
		function(err, res){
			if (err) {
				console.log('ERRO FINEX TICKER'+err);
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
			}
		});
	})
}


function finexBal(){

	bitfinex.wallet_balances(function(err, res){
		if (err) {
			console.log('ERRO FINEX BALANCE'+err);
		}else{
			for (i in res){
				if (res[i].type === 'exchange') {
					var data = res[i];
					if (res[i].available > 0.001) {
						var curr = res[i].currency;
						balance.finex[curr] = res[i].available;
					}
				}
			}
		}
	})
}

//
//KRAKEN FUNCTIONS
//

function krakenTicker(){
	var pairs = ['XLTCXXBT', 'XXDGXXBT', 'XETHXXBT', 'XDAOXETH', 'XETCXXBT', 'XETCXETH', 'XDAOXXBT'];

	pairs.forEach(function(kkpair){
		kraken.api('Ticker', {"pair": kkpair}, function(error, data) {
			if(error) {
				console.log('ERRO KK TICKER '+error);
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
			case 'XETCXXBT':
				var spair = 'etcbtc';
				break;
			case 'XETCXETH':
				var spair = 'etceth';
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
			myDB[objID]['last'] = data.result[kkpair].c[0]
			}
		});
	});

}

function krakenBal(){

	kraken.api('Balance', null, function(error, data) {
	    if(error) {
	        console.log('ERRO KK BALANCE ' +error);
	    }
	    else {
	    	for (var i in data.result){
	    	switch(i){
			case 'XLTC':
			var curr = 'ltc';
			break;
			case 'XXDG':
				var curr = 'doge';
				break;
			case 'XETH':
				var curr = 'eth';
				break;
			case 'XDAO':
					var curr = 'dao';
					break;
			case 'XETC':
				var curr = 'etc';
				break;
			case 'XXBT':
				var curr = 'btc';
			}
			if(data.result[i] > 0.000001)

	        	balance.kraken[curr] = data.result[i];
	    	}
	    }
	});
}


//
//BITTREX FUNCTIONS
//

function bittrexTicker(){
	bittrex.getmarketsummaries( function(data) {
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
    		}

    	}
	});
}



function bittrexBal(){
	bittrex.getmarketsummaries( function(data) {
		for( var i in data.result ) {
	    	var xpair = data.result[i].MarketName;
	    	var pairs = xpair.split("-");
			var spair = pairs[1];
			bittrex.getbalance({ currency : spair }, function( data ) {
				if (data.result.Available > 0.0001) {
					var curr = data.result.Currency;
					var low = curr.toLowerCase();
					balance.bittrex[low] = data.result.Available;
				}
			});
		}
	});
}







//Profits 
var iprofit = 0.0075;
var pprofit = 0.0075;



//Comparing Prices

function compare(){
	for (var objID in myDB) {
		var xchgvenda =  myDB[objID]['xchg'];
		var apair =  myDB[objID]['pair'];
		var pvenda  = myDB[objID]['bid'];
		var ultvenda = myDB[objID]['last'] *0.9995;
		for (var objID in myDB) {
			if( myDB[objID]['xchg'] !== xchgvenda ){
				var xchgcompra =  myDB[objID]['xchg'];
				if ( myDB[objID]['pair'] === apair ) {
					var pcompra =  myDB[objID]['ask'];
					var ilucro = (((pvenda * (1 - fees[xchgvenda].m))/(pcompra * (1 + fees[xchgcompra].t))) -1);
					var ulucro = (((ultvenda* (1 - fees[xchgvenda].m))/(pcompra * (1 + fees[xchgcompra].t))) -1);
					if (ulucro > pprofit){
					console.log('potential : sell '+apair+' @ '+ultvenda+' @ '+xchgvenda+' buy @ '+pcompra+' @ '+xchgcompra+' @ '+(ulucro*100)+'%. \n');
					}
					if(ilucro > iprofit){
					console.log('INSTANT  sell '+apair+' @ '+pvenda+' @ '+xchgvenda+' buy @ '+pcompra+' @ '+xchgcompra+' @ '+(ilucro*100)+'%. \n');
					}

				}

			}

		}
			
	}

}




/*if(balance[xchgvenda][pairv] > 0){
	if(balance[xchgcompra][pairc] > 0){
		if(pprofit > iprofit){
			//create last price onder
		}else if (iprofit >= pprofit ) {
			//create instant buy order
		}
	}
}
*/



/*
function getZPairs(){
	for (var i in myDB){
		var pairv = myDB[i]['pairs'];
		console.log(pairv);
	}
}


setInterval(function runBalances(){
	getZPairs();
}, 10000)
*/

function getBalances(){
	btceBal();
	bittrexBal();
	poloBal();
	krakenBal();
	finexBal();

}


//Running Parameters


setImmediate(function start(){
	setFees();
	getBalances();
})


setInterval(function runBalances(){
	console.log(balance);
}, 5000)


/*
setInterval(function runTickers(){
	poloTicker();
	btceTicker();
	finexTicker();
	krakenTicker();
	bittrexTicker();
}, 5000)
*/

/*
setInterval(function runBalances(){
	getBalances();
}, 15000)


setInterval(function runCompare(){
	compare();
	console.log("\n\n\n\n\n\n\n\n\n");
}, 1000)

*/


