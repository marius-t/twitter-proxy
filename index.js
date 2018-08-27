'use strict';

const 
	express = require('express'),
	app = express(),
	http = require('http'),
	Twitter = require('twitter'),
	dotenv = require('dotenv').config(),
	socketIO = require('socket.io'),
	client = new Twitter({
		consumer_key: process.env.consumerKey,
		consumer_secret: process.env.consumerSecret,
		access_token_key: process.env.accessToken,
		access_token_secret: process.env.accessTokenSecret
	});





//Get latest tweets
app.get('/', async (req, res, next) => {
  const response = {status: 'sucess'};
  
  //We set CORS in order to avoid issues on cross origin
  res.setHeader('Access-Control-Allow-Origin', '*');

  client.get('search/tweets', {q: '#nowplaying', count: 100, result_type: 'recent', include_entities: true}, (error, tweets, responseBody) => {

  	//in case of error send error response
  	if(error) {
  		res.status(400).send(error);
  	}

  	const filteredTweets = tweets.statuses.map((tweet) => {

  		if( Array.isArray(tweet.entities.urls) ) {
					let tweetCheck =  tweet.entities.urls.filter(obj => Object.keys(obj).some(key => obj[key].includes('youtu.be') || obj[key].includes('youtube.com')));

					if(tweetCheck.length > 0) {
						return tweet;
					}
  		}
  	});

  	const tweetsResults = filteredTweets.filter(tweet => tweet);
  	
  	response['tweets'] = tweetsResults;
  	res.status(200).send(response);

  });
  
});

//Post a tweet to #nowplaying timeline
app.post('/', async (req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	const
		url = req.query.url || null,
		comment = req.query.comment || null;

	if( url && comment && ( url.includes('youtube.com') || url.includes('youtu.be') ) ) {
		client.post('statuses/update', {status: comment +' #nowplaying ' + url, }, function(error, tweet, response) {
		  if (!error) {
		    console.log(tweet);
		    res.status(200).send({status: 'success', message: 'Video posted.'})
		  }
		});
	} else {
		res.status(200).send({status: 'error', message: 'Video and comment are required. Please make sure you submit a youtube.com URL'});
	}
});


const server = http.createServer(app);


server.listen('8080', function() {
	console.log('Express server ' + app.settings.env + ' listening on port ' + server.address().port);
});

const socketServer = socketIO(server);

socketServer.on('connection', (socketClient) => {
  

  /**
   * Stream statuses filtered by keyword
   * number of tweets per second depends on topic popularity
   **/

  console.log('here');
  client.stream('statuses/filter', {track: '#nowplaying', url:'youtube.com'},  function(stream) {
    stream.on('data', function(tweet) {
    	
    	if( Array.isArray(tweet.entities.urls) ) {
    		let tweetCheck =  tweet.entities.urls.filter(obj => Object.keys(obj).some(key => obj[key].includes('youtu.be') || obj[key].includes('youtube.com')));

    		if( tweetCheck.length > 0 ) {
    			console.log( 'data tweet' );
    			socketClient.emit('new-tweet', tweet);
    		}
    	}
    });
  
    stream.on('error', function(error) {
      console.log(error);
    });
  });


  socketClient.on('disconnect', () => {
  	console.log('client disconnected');
  });
});





  