$(function() {	
	  var $window = $(window);	 
	  
	var username = Math.random().toString(36).substr(2, 5);
	username = cleanInput(username);

	var socket = io();
	  $('form').submit(function(){
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	  });
	  
	  socket.on('chat message', function(data){
		$('#messages').append($('<li>').text(data.username + ": " + data.message));
	  });
	  
	  socket.on('login', function (data) {
    
    // Display the welcome message
    $('#messages').append($('<li>').text("Welcome to Socket.IO Chat. " + data.numUsers + " users online"));
  });
	  
	  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
	  $('#messages').append($('<li>').text(data.username + ' joined. ' + data.numUsers + ' users here.'));
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
	  $('#messages').append($('<li>').text(data.username + ' left. ' + data.numUsers + ' users remain.'));
  });

	  
	  function cleanInput (input) {
		return $('<div/>').text(input).text();
	  }
	  
	  
	  // Tell the server your username
	  socket.emit('add user', username);
});