var socket  = require( './node_modules/socket.io' );
var express = require('./node_modules/express');
var app     = express();
var server  = require('http').createServer(app);
var io      = socket.listen( server );
var port    = process.env.PORT || 3000;
var users = [];

server.listen(port, function () {
  console.log('Server listening on port %d', port);
});

io.on('connection', function (socket) {
	socket.on('new user', function(name,send_by, callback){
		if(name.length > 0){
			if(users.indexOf(name) == -1){
				socket.username = name;

				socket.send_by = send_by;
				//alert(send_by);
				users.push(socket.username);
				//users.push(socket.send_by);

				updateUsers();
				callback(true);
			} else{
				callback(false);
			}
		}
	});

	socket.on('new message', function(msg,sendby,userid){
		var sender = socket.username;
		var message = msg;
		var sendby = sendby;
		io.emit('push message', {name: sender,  msg: message,sendby: sendby,userid: userid});
	});

	function updateUsers(){
	    io.emit('users', users);
	}

	socket.on('disconnect',function(){
		if(socket.username){
			users.splice(users.indexOf(socket.username),1);
			updateUsers();
		}
	});
});