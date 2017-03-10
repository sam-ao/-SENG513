// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    $('form').submit(function(){
		socket.emit('chat', $('#m').val());
		$('#m').val('');
		return false;
    });

    socket.on('connection');

    socket.on('getCookie', function(){
    	var nameVariable = "nickname=";
    	var colorVariable = "color=";
	    var decodedCookie = decodeURIComponent(document.cookie);
	    var ca = decodedCookie.split(';');
	    var nickname;
	    var color;
	    for(var i = 0; i < ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(nameVariable) == 0) {
	        	nickname = c.substring(nameVariable.length, c.length);
	        }
	        if (c.indexOf(colorVariable) == 0) {
	        	color = c.substring(colorVariable.length, c.length);
	        }
	    }
	    if(nickname && color){
	    	socket.emit('foundCookie', {nickname, color});
	    }
	    else {
	    	socket.emit('notFoundCookie');
	    }
    });

    socket.on('chatlog', function(messagelog){
    	for(i = 0; i < messagelog.length; i++) {
    		$('#messages').append($('<li>').html(messagelog[i]));
    	}
    	var messageBox = document.getElementById("messages");
      	messageBox.scrollTop = messageBox.scrollHeight;
    });

    socket.on('setNickname', function(nickname){
    	$('#greeting').text("Hi, "+nickname);
    	var date = new Date();
	    date.setTime(date.getTime() + (30*24*60*60*1000));
	    var expires = "expires="+ date.toUTCString();
	    document.cookie = "nickname=" + nickname + ";" + expires + ";path=/";
    });

    socket.on('setColor', function(color){
		var date = new Date();
	    date.setTime(date.getTime() + (30*24*60*60*1000));
	    var expires = "expires="+ date.toUTCString();
	    document.cookie = "color=" + color + ";" + expires + ";path=/";
    });

    socket.on('userlist', function(userlist){
    	$('#user-list').empty();
    	for(let user of userlist) {
    		$('#user-list').append($('<li>').html("<font color=\""+user.color+"\">"+user.nickname+"<\/font>"));
    	}
    	/*for(i = 0; i < userlist.length; i++) {
    		$('#user-list').append($('<li>').text(userlist[i].nickname));
    	}*/
    });

    socket.on('chat', function(msg){
		$('#messages').append($('<li>').html(msg));
		var messageBox = document.getElementById("messages");
      	messageBox.scrollTop = messageBox.scrollHeight;
    });


});
