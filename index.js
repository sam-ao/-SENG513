var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

var users = new Map();
// listen to 'chat' messages
io.on('connection', function(socket){
	socket.emit('getCookie');
	users.set(socket, {nickname: "", color: "#111111"});
	var greeting_message;
	socket.on('foundCookie', function(cookie){
		var nameExists = false;
		users.forEach(function(user, socket){
			if(user.nickname == cookie.nickname) {
				nameExists = true;
			}
		});
		if(!nameExists) {
			users.set(socket, {nickname: cookie.nickname, color: cookie.color});
		}
		else {
			users.set(socket, {nickname: generateNickname(), color: "#111111"});
		}
		socket.emit('setNickname', users.get(socket).nickname);
		socket.emit('setColor', users.get(socket).color);
		socket.emit('chatlog', chatLog);
		socket.emit('chat',"Welcome to the chatroom, <font color=\"" + users.get(socket).color + "\">" 
	    					+ users.get(socket).nickname + "<\/font>.");
		greeting_message = timeStamp()
	    					+ " <font color=\"" + users.get(socket).color + "\">" 
	    					+ users.get(socket).nickname + "<\/font> joined the chatroom.";
		socket.broadcast.emit('chat', greeting_message);
		storeMessage(greeting_message);
		updateAllUsers();
	});
	socket.on('notFoundCookie', function(){
		users.set(socket, {nickname: generateNickname(), color: "#111111"});
		socket.emit('setNickname', users.get(socket).nickname);
		socket.emit('setColor', users.get(socket).color);
		socket.emit('chatlog', chatLog);
		socket.emit('chat',"Welcome to the chatroom, <font color=\"" + users.get(socket).color + "\">" 
	    					+ users.get(socket).nickname + "<\/font>.");
		greeting_message = timeStamp()
	    					+ " <font color=\"" + users.get(socket).color + "\">" 
	    					+ users.get(socket).nickname + "<\/font> joined the chatroom.";
		socket.broadcast.emit('chat', greeting_message);
		storeMessage(greeting_message);
		updateAllUsers();
	});
    socket.on('chat', function(msg){
    	if(!checkCommands(socket, msg)){
	    	var message = timeStamp()
	    				+ " <font color=\"" + users.get(socket).color + "\">" + users.get(socket).nickname + "<\/font>: " 
	    				+ msg;
	    	var bolded_message = "<b>"+message+"<\/b>";
	    	storeMessage(message);
	    	socket.broadcast.emit('chat', message);
	    	socket.emit('chat', bolded_message);
		}
	});

    socket.on('disconnect', function(){
    	var goodbye_message = timeStamp()
	    			+ " <font color=\"" + users.get(socket).color + "\">" 
	    			+ users.get(socket).nickname + "<\/font> left the chatroom.";
    	socket.broadcast.emit('chat', goodbye_message);
    	storeMessage(goodbye_message);
    	users.delete(socket);
    	updateAllUsers();
  	});
});
function checkCommands(socket, msg) {
	switch(msg.split(" ")[0]){
		case '/nick':
			var newNick = msg.split(" ")[1];
			var nameExists = false;
			users.forEach(function(user, socket){
				if(user.nickname == newNick) {
					nameExists = true;
				}
			});
			if(!msg.split(" ")[1] || msg.split(" ")[2]){
				socket.emit('chat',"Invalid nickname.");
			}
			else if(!nameExists) {
				users.set(socket, {nickname: newNick, color: users.get(socket).color});
				socket.emit('setNickname', users.get(socket).nickname);
				updateAllUsers();
				socket.emit('chat',"Nickname changed to " + newNick + ".");
			}
			else {
				socket.emit('chat',"That nickname is already taken.");
			}
			return true;
		break;

		case '/nickcolor':
			var newColor = msg.split(" ")[1];
			var rgb = /[0-9A-Fa-f]{6}/i;
			if(rgb.test(newColor)) {
				users.set(socket, {nickname: users.get(socket).nickname, color: newColor});
				updateAllUsers();
				socket.emit('setColor', users.get(socket).color);
				socket.emit('chat',"<font color=\""+users.get(socket).color+"\">Font color updated.<\/font>");
			}
			else {
				socket.emit('chat',"Invalid color code.");
			}
			return true;
		break;
	}
}
var chatLog = [];

function storeMessage(msg) {
	if(chatLog.length < 200) {
		chatLog.push(msg);
	}
	else {
		chatLog.shift();
		chatLog.push(msg);
	}
}

var userList = [];
var userCount = 0;

function updateAllUsers() {
	userList = [];
	users.forEach(function(user, socket){
		userList.push(user);
	});
    userList.sort(function(a, b){
		return a.nickname < b.nickname ? -1 : 1;
	});
	io.emit('userlist', userList);
}

function generateNickname() {
	userCount++;
	var userNumber;
	if(userCount<10) {
		userNumber = '00'+userCount;
	}
	else if (userCount<100) {
		userNumber = '0'+userCount;
	}
	else {
		userNumber = userCount;
	}
	var nickname = 'User'+userNumber;
	return nickname;
}

function timeStamp() {
	var time = new Date();
	var dd = time.getDate();
	var mm = time.getMonth()+1; //January is 0!
	var yyyy = time.getFullYear();
	var hours = time.getHours();
	var minutes = time.getMinutes();
	var seconds = time.getSeconds();

	if(dd<10) {
	    dd='0'+dd;
	} 
	if(mm<10) {
	    mm='0'+mm;
	} 
	if(hours<10) {
	    hours='0'+hours;
	} 
	if(minutes<10) {
	    minutes='0'+minutes;
	}
	if(seconds<10) {
	    seconds='0'+seconds;
	}

	var timeStamp = mm+'/'+dd+'/'+yyyy+', '+hours+':'+minutes+':'+seconds;
	var coloredTimeStamp = "<font color=\"#aaaaaa\">" + timeStamp + "<\/font>"
	return coloredTimeStamp;
}