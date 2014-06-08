/**
 * Module dependencies
 */

var express = require('express'),
	cookieParser = require('cookie-parser'),
	session      = require('express-session'),
 	http = require('http'),
  	path = require('path'),
  	passport = require('passport'),
  	TwitterStrategy = require('passport-twitter').Strategy,
  	request = require('request'),
  	_ = require('underscore'),
  	oauth = {
      consumer_key    : "5GfhKfFzAS1vG40TjLUNLUIbk",
      consumer_secret : "MPKDmHCLnZRQ9ExBu1c6fS0rdBC7B6NkqIrw9SkEJUzgKjGj82",
      token           : "159273941-CZUKmd3zd8qtQNjZmwJH8WhxliqnkmKY8bRRopvQ",//req.session['oauth:twitter']['oauth_token'],
      token_secret    : "j2aO0CXJbMVXKkO0AST4dyQTZrtaQoUerv8fXLuFxVYE0"//req.session['oauth:twitter']['oauth_token_secret']
    };

var app = module.exports = express();

var this_token, this_tokenSecret;

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()) // required before session.
app.use(session({
    secret: 'keyboard cat'
  , proxy: true // if you do SSL outside of node.
}))
app.use(passport.initialize());
app.use(passport.session());
// development only

passport.use(new TwitterStrategy({
    consumerKey: oauth.consumer_key,
    consumerSecret: oauth.consumer_secret,
    callbackURL: "http://localhost:3000/"
  },
  function(req,token, tokenSecret, profile, done) {
    var oauth = {
      consumer_key    : "5GfhKfFzAS1vG40TjLUNLUIbk",
      consumer_secret : "MPKDmHCLnZRQ9ExBu1c6fS0rdBC7B6NkqIrw9SkEJUzgKjGj82",
      token           : token,
      token_secret    : tokenSecret
    }

    var url = 'https://api.twitter.com/1.1/search/tweets.json?q=%23newshack';
    console.log(req);
    request.get({url:url, oauth:oauth, json:true}, function (e, r, result) {
    	console.log(result);
    });
  	done(null, false);
  }
));

/**
 * Routes
 */

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/'}));

app.get('/get/:query/:address/:radius/:type/:count', function(req,res) {

	var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + req.params.address + "&key=AIzaSyAtxKiAoIx4xZeJsbP0G8S8vQ8f89e6fjk";

	request.get(url, function(e,r,geo_res) {
		// console.log(geo_res[0]);
		var geo_json = JSON.parse(geo_res);
		// console.log(geo_json.results);
		// for(var prop in geo_res) {
		// 	console.log(prop);
		// }
		var loc = geo_json.results[0].geometry.location;
		// console.log(loc);
	    url = 'https://api.twitter.com/1.1/search/tweets.json?q=' + escape(req.params.query)
	    	+ "&geocode=" + loc.lat +"," + loc.lng + "," + req.params.radius + "mi"
	    	+ "&result_type=" + req.params.type
	    	+ "&count=" + req.params.count;
	    console.log(url);
	    request.get({url:url,oauth:oauth,json:true}, function(e,r,result) {
	    	var statuses = result.statuses;
	    	console.log(statuses);
	    	var search_result = _.groupBy(statuses, function(status) {
	    		return status.user.screen_name;
	    	});
	    	console.log(search_result);
	    	res.json(search_result);
	    });
	});
});

app.get('/gettweet/:id', function(req,res) {
	console.log(req.params.id);
    var url = 'https://api.twitter.com/1/statuses/oembed.json?id=' + req.params.id;

    request.get({url:url,oauth:oauth,json:true}, function(e,r,result) {
    	// console.log(result);
    	res.json(result);
    });
});

// app.get('/get', function(req,res) {

// 	var oauth = {
//       consumer_key    : configAuth.twitterAuth.consumerKey,
//       consumer_secret : configAuth.twitterAuth.consumerSecret,
//       token           : token,
//       token_secret    : tokenSecret
//     };

//     var url = 'https://api.twitter.com/1.1/users/show.json?';

//     request.get({url:url,oauth:oauth,json:true}, function(e,r,result) {

//     });

// 	// request.post({url:'https://api.twitter.com/oauth2/token',body:'grant_type=client_credentials'}, function(e,r,body) {
// 	// 	console.log(body);
// 	// });

// 	// console.log(req);
// 	// console.log(this_token);
// 	// console.log(this_tokenSecret);
// 	// var oauth =
// 	//         { consumer_key: "5GfhKfFzAS1vG40TjLUNLUIbk"
// 	//         , consumer_secret: "MPKDmHCLnZRQ9ExBu1c6fS0rdBC7B6NkqIrw9SkEJUzgKjGj82"
// 	//         , token: this_token
// 	//         , token_secret: this_tokenSecret
// 	//         };
//  //    request.get({url:'https://api.twitter.com/1.1/search/tweets.json?q=%23newshack', oauth:oauth, json:true}, function (e, r, user) {
//  //      console.log(user)
//  //    });
// })

// app.get('/get', function(req,res) {
// 	var qs = require('querystring')
// 	  , oauth =
// 	    { callback: 'http://localhost:3000/callback/'
// 	    , consumer_key: "5GfhKfFzAS1vG40TjLUNLUIbk"
// 	    , consumer_secret: "MPKDmHCLnZRQ9ExBu1c6fS0rdBC7B6NkqIrw9SkEJUzgKjGj82"
// 	    }
// 	  , url = 'https://api.twitter.com/oauth/request_token'
// 	  ;
// 	request.post({url:url, oauth:oauth}, function (e, r, body) {
// 	  // Ideally, you would take the body in the response
// 	  // and construct a URL that a user clicks on (like a sign in button).
// 	  // The verifier is only available in the response after a user has
// 	  // verified with twitter that they are authorizing your app.
// 	  var access_token = qs.parse(body)
// 	    , oauth =
// 	      { consumer_key: CONSUMER_KEY
// 	      , consumer_secret: CONSUMER_SECRET
// 	      , token: access_token.oauth_token
// 	      , verifier: access_token.oauth_verifier
// 	      }
// 	    , url = 'https://api.twitter.com/oauth/access_token'
// 	    ;
// 	  request.post({url:url, oauth:oauth}, function (e, r, body) {
// 	    var perm_token = qs.parse(body)
// 	      , oauth =
// 	        { consumer_key: CONSUMER_KEY
// 	        , consumer_secret: CONSUMER_SECRET
// 	        , token: perm_token.oauth_token
// 	        , token_secret: perm_token.oauth_token_secret
// 	        }
// 	      , url = 'https://api.twitter.com/1.1/users/show.json?'
// 	      , params =
// 	        { screen_name: perm_token.screen_name
// 	        , user_id: perm_token.user_id
// 	        }
// 	      ;
// 	    url += qs.stringify(params)
// 	    request.get({url:url, oauth:oauth, json:true}, function (e, r, user) {
// 	      console.log(user)
// 	    })
// 	  })
// 	})
// });

app.get('/:name', function(req,res) {
  res.sendfile(req.params.name);
});
// redirect all others to the index (HTML5 history)
app.get('*', function(req,res) {
  res.sendfile('./views/index.html');
});


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
