/**
* Configures websocket connections on a server port when started.
* @param server: a http.Server object to operate on.
*/
exports.start = function( server ) {
	
	var io = require('socket.io').listen(server);
	
	// Turn off default socket.io logging.
	io.disable('log level');
	
	// Builds a message object.
	function mssg(message, user) {
		return {
			user: (user || ''),
			message: (message || ''),
			time: new Date().getTime()
		};
	}
	
	// Socket.io interface.
	io.sockets.on('connection', function(socket) {
		
		// User identity notifications.
		socket.on('id', function(user) {
			// Notify of user joining the chat.
			io.sockets.emit('message', mssg(user+' has joined the chat.'));
			
			// Notify of user leaving the chat.
			socket.on('disconnect', function() {
				io.sockets.emit('message', mssg(user+' has disconnected.'));
			});
		});
		
		// Message transmission relay.
		socket.on('message', function(data) {
			socket.broadcast.emit('message', data);
		});
	});
};
