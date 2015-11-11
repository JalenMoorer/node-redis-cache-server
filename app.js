var request = require('request');
var express = require('express');
var morgan  = require('morgan');
var redis   = require('redis');

var app = express();

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
		Authorization');
	next();
})

app.use(morgan('dev'));

console.log("Server Start");

var client = redis.createClient();

var forecastHandler = function(req, res, lat, lng) {
	request('https://api.forecast.io/forecast/{Your_APIKEY_Here}/' + lat + ',' + lng, 
		function (error, response, body) {
			if(!error && response.statusCode == 200) {
				var key = lat + lng;
				console.log('Forecast-io data was returned!');
				response = JSON.stringify(response);
				client.setex(key, 1800, response);
				res.setHeader('Content-Type', 'application/json');
				res.send(body);
			}
		}
	)
};

var cacheHandler = function(res, cacheData) {
	console.log('Cache data was returned!');
	cacheData = JSON.parse(cacheData);
	res.setHeader('Content-Type', 'application/json');
	res.send(cacheData.body);
};

var getCache = function(req, res, lat, lng) {
	console.log('getCache called');
	var key = lat + lng;
	console.log(key);
	client.get(key, function (err, result) {
		if (err || !result) {
			forecastHandler(req, res, lat, lng); 
		}
		else {
			cacheHandler(res, result);
		}
	});
}

app.get('/', function(req,res) {
	res.send('Welcome to the api home');
});

var apiRouter = express.Router();

apiRouter.get('/fetch', function(req, res) {
	var lat = req.query.lat;
	var lng = req.query.lng;
	getCache(req, res, lat, lng);
});

app.use('/api', apiRouter);

var server = app.listen(3000, function() {
	console.log('Magic is happening on port 3000');
});