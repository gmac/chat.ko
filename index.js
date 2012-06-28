/**
* Bootstraps the application.
*/
var server = require('./lib/server.js').start( 8080 ),
	sockets = require('./lib/websockets.js').start( server );