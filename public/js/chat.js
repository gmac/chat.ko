/**
* Chat ViewModel
* @requires Knockout, jQuery, scrollTo, socket.io, chat-utils
*/
$(function() {
	"use strict";
	
	/**
	* Install ease in/out methodology into jQuery easing library.
	*/
	$.easing.easeInOut = function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	};

	/**
	* RETURN key binding for Knockout.
	*/
	ko.bindingHandlers.returnKey = {
	    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
			ko.utils.registerEventHandler(element, 'keydown', function(evt) {
				if (evt.keyCode === 13) {
					evt.preventDefault();
					evt.target.blur();
					valueAccessor().call(viewModel);
				}
			});
	    }
	};

	/**
	* Chat message view.
	*/
	var ChatMessageView = function(data) {
		this.user = data.user;
		this.message = data.message;
		this.time = data.time;
	};
	ChatMessageView.prototype = {
		user: '',
		message: '',
		time: 0,

		// Formats a milliseconds date as human-readable timestamp.
		formatTime: function() {
			var t = new Date(this.time),
				m = t.getMinutes();
			return (t.getHours() % 12 || 12) +':'+ (0 <= m && m < 10 ? "0"+m : m) +' '+ (t.getHours() < 12 ? 'AM' : 'PM');
		},

		// Gets colors from a table, as assigned to unique user names.
		color: (function() {
			var colors = ['#9c1c24', '#526e90', '#bf7926', '#5E7630', '#483580'],
				users = {},
				index = 0;

			return function(user) {
				if (!user) {
					return '#999999';
				} else if (!users.hasOwnProperty(user)) {
					users[user] = colors[ index++ % colors.length ];
				}
				return users[user];
			};
		}()),

		// Gets a tinted shade of user-specific colors.
		bgColor: function(user) {
			var c = this.color(user),
				r = parseInt(c.substr(1, 2), 16),
				g = parseInt(c.substr(3, 2), 16),
				b = parseInt(c.substr(5, 2), 16),
				p = 1 - 0.15;

			r = r + (255 - r) * p;
			g = g + (255 - g) * p;
			b = b + (255 - b) * p;
			return 'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')';
		}
	};
	
	/**
	* Chat console view.
	*/
	var ChatView = function() {
		var self = this,
			view = $('#chat-log');
		
		this.user = ko.observable('Guest');
		this.socket = ko.observable(null);
		this.message = ko.observable('');
		this.chatLog = ko.observableArray([]);
		this.isConnected = ko.computed(function() {
			return !!this.socket();
		}, this);
		
		// Sends a message to the remote.
		this.send = function(message, user) {
			if (this.isConnected()) {
				var mssg = {
					user: (user || ''),
					message: (message || ''),
					time: new Date().getTime()
				};
				
				this.socket().emit('message', mssg);
				this.receive(mssg);
			}
		};
		
		// Receives a message into the view.
		this.receive = function(mssg) {
			this.chatLog.push( new ChatMessageView(mssg) );
			view.scrollTo(view[0].scrollHeight, 400, {easing:'easeInOut'});
		};
		
		// Establishes a remote connection.
		this.connect = function() {
			if (this.user()) {
				this.socket( io.connect("/", {'force new connection': true}) );
				
				this.socket().on('message', function(data) {
					self.receive(data);
				});
				
				this.socket().emit('id', this.user());
			}
		};
		
		// Disconnects from the chat.
		this.disconnect = function() {
			if (this.isConnected()) {
				this.socket().disconnect();
				this.socket(null);
				this.chatLog([]);
			}
		};
		
		// Submits a new message from the view to the control.
		this.submit = function() {
			if (this.message()) {
				this.send(this.message(), this.user());
				this.message('');
				$('#chat-message').focus();
			}
		};
	};

	ko.applyBindings( new ChatView() );
});