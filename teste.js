var request = require('request');
var flatten = require('flat');
var n = require('nonce')();


//Poloniex Definitions
var Poloniex = require('poloniex.js');
Poloniex.STRICT_SSL = false;
var poloniex = new Poloniex('WCPO2NDL-1K08IB7D-FUP12VOM-B3FJ0PHN', '6ad5e7890ab16dff8556a4f6ce1f6646f98b638c62df0767a494c259b58f1137aaf1ce97a69c49fd3a3e11f8390dff5a66ff73eace68d3d785af0ee23e6fc3e1');

//BTC-e Definitions
var BTCE = require('btce-deal');
 
var btcePublic = new BTCE.Public(),
    btceTrade = new BTCE.Trade('6APEFI9K-I7ODZGB8-SHWLX78Y-RY4LK4Y9-UAOMLVXZ', 'f587d4b73e1a0ceab01a022ef61bb571f262a28a87767ef36ad97c0626c25221');


//Objects Definition
var myDB = {};

// 
// POLONIEX FUNCITONS
//


function poloTicker(){
	poloniex.getTicker(function(err, data){
	    if (err){
	    	console.log(err);
	    }

	    console.log(data);
	});
}

// 
// BTCE FUNCTIONS
//

function btceTicker(){
	var pairs = ['eth_btc', 'ltc_btc', 'dsh_btc', 'eth_ltc', 'nmc_btc', 'ppc_btc', 'nvc_btc'];
	btcePublic.getTicker(pairs)
	.then(function (data) {
		console.log(data)
    })
    .error(function (data) {
        console.log(data) 
    });
}

btceTicker();