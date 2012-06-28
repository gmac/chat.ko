/**
* Builds and returns a http.Server object when started.
*/
exports.start = function( port ) {
	
	var connect = require('connect'),
		server = connect.createServer().use( connect.static(__dirname+'/../public') );
	
	console.log('Starting server on port %s', port);
	return server.listen( port );
};