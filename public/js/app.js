(function($) {

	'use strict';

	$(document).ready( function() {
		var index = 1,
			filter = 'tweet';
		// var ts = {
		// 	q:"%23newshack",
		// 	geocode: escape("42.358283,-71.093425,1mi"),
		// 	type:escape("recent"),
		// 	count : 100
		// },
		// html_elem = "<div></div>";

		// var twq = ts.q + "&geocode=" + ts.geocode + "&result_type=" + ts.type + "&count=" + ts.count;
		// console.log(twq);

		var container_elem = "<div class='tweet-container'><div class='tweet-author'><a class='tweet-author-link' href='https://twitter.com/tweetauthor' target='_blank'>tweetauthor</a></div>",
			tweet_elem = "<div class='tweet'><div class='tweet-body'>tweettext</div></div>";

		$("#add-plus").on("click", function(event) {
			$(this).before("<input class='filter-and-or-" + index + "' type='button' name='filter-name-'" + index + " value='&'><input placeholder='#another' class='filter-text' type='text' name='filter-text-" + index + "'>");
			$('.filter-and-or-' + index).on('click', function(event) {
				if($(this).val() === '&') {
					$(this).val('or');
				} else if($(this).val() === 'or') {
					$(this).val('&');
				}
			});
			index++;
		});

		$(".radio-button").on('click', function(event) {
			event.preventDefault();
			$(".radio-button[data-checked=true]").attr("data-checked", "false");
			$(this).attr("data-checked", "true");
			filter = $(this).val();
			console.log(filter);
		});

		$("#twitter-search").on("submit", function(event) {
			event.preventDefault();
			var ts = {
				type: escape("recent"),
				count: 100
			};
			$(this).children('input:not([type=submit])').each(function(index,element) {
				ts[$(element).attr('name')] = $(element).val();
			});

			var and_filters = [],
				or_filters = [];

			$('.filter-text').each(function(index,element) {
				var operator = $(this).prev().val();
				if(operator === '&') {
					and_filters.push($(this).val());
				} else if (operator === 'or') {
					or_filters.push($(this).val());
				}
			});

			console.log(and_filters);
			console.log(or_filters);

			console.log(ts);
			var twq = escape(ts.query) + "/" + escape(ts.address) + "/" + escape(ts.radius) + "/" + ts.type + "/" + ts.count;
			console.log(twq);
			$.get('/get/' + twq, function(users,err) {
				// console.log(data)
				$.each(users,function(index,user) {
					console.log(user);
					var elem_string = container_elem.replace('tweetauthor', index).replace('tweetauthor', index);

					for(var username in user) {
						var element = user[username];
						console.log('/gettweet/' + element.id);
						console.log(element);
						var tweet_string = tweet_elem.replace('tweettext',element.text);
						var mentions = element.entities.user_mentions;
						for(var i in mentions) {
							console.log(i);
							var handle = '@' + mentions[i]
							tweet_string.replace(handle, '<a href="https://www.twitter.com/'+mentions[i]+'">'+handle+'</a>')
						}
						console.log(element.entities.user_mentions);
						// for (var index in element.entities.user_mentions) {
						// 	var element = element.entities.user_mentions[index];
						// 	console.log(index);
						// 	elem_string = elem_string.replace('@'+element.screen_name,'<a href="https://www.twitter.com/'+element.screen_name+'" target="_blank">'+'@'+element.screen_name+'</a>');
						// }
						console.log(elem_string);
						elem_string += tweet_string;
					}
					elem_string += "</div>";
					$('body').append(elem_string);
				});

			});
		});


	});






})(jQuery);
