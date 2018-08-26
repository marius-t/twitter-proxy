'use strict';

const 
	express = require('express'),
	app = express(),
	twitter = require('twitter'),
	dotenv = require('dotenv').config();


//Get latest tweets
app.get('/', async (req, res, next) => {
	console.log( 'get' );
});

//Post a tweet to #... timeline
app.post('/', async (req, res, next) => {
	console.log( 'post' );
});


const server = app.listen('8080', function() {
	console.log('Express server ' + app.settings.env + ' listening on port ' + server.address().port);
});