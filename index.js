var pg = require('pg');
var express = require('express');
var app = express();
var cool = require('cool-ascii-faces');
var http = require('http').Server(app);
var io = require('socket.io')(http);
//app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 3000));

//app.get('/', function(request, response) {
//  response.send(cool());
//});

app.get('/', function(request, response) {
  var result = "<HTML><HEAD><script>  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');  ga('create', 'UA-63019279-1', 'auto');  ga('send', 'pageview');</script></HEAD><BODY>";
  var times = process.env.TIMES || 5
  for (i=0; i < times; i++) {
	  result += "<marquee behavior='alternate' direction=" 
		+ (Math.floor((Math.random() * 2) + 1) % 2 == 0 ? "'left' " : "'right' ") 
		+ "scrollamount='" + Math.floor(((Math.random() * 12) + 1 ))+ "'"
		+ ">" + cool() + "</marquee><br />";
  }
  result += '</BODY></HTML>'
  response.send(result);
})

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.send(result.rows); }
    });
  });
})

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){	
  console.log('a user connected');
  var addedUser = false;
  
   socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });
  
  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.username);
	
	// remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
  }});
  
   socket.on('chat message', function(msg){
    console.log('message: ' + msg);
	io.emit('chat message', msg);
  });
});



http.listen(app.get('port'), function(){
  console.log('listening on *:'+ app.get('port'))
});

/*app.listen(app.get('port'), function() {
  console.log("Node app is running on port:" + app.get('port'))
})*/