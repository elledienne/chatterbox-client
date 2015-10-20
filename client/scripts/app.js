// YOUR CODE HERE:
var app = {
  lastMessage: null,
  rooms: {},
  init: function() {
  },
  server: 'https://api.parse.com/1/classes/chatterbox',
  send: function(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  },
  fetch: function(){
    $.ajax({
      url: app.server,
      type: 'GET',
      contentType: 'application/json',
      success: app.displayChats,
      error: function (data) {
        console.error('chatterbox: Failed to receive message');
      }
    });
  },
  displayChats: function(response){
    var results = response.results;
    //_.each(results, app.addMessage);
    var $chatsToPrepend = $('<span></span>');
    _.some(results, function(post) {
      if(post.objectId === app.lastMessage) {
        return true;
      } else {
        $chatsToPrepend.append(app.addMessage(post));
        return false;
      }
    })
    app.lastMessage = $chatsToPrepend.children().first().attr('id') || app.lastMessage;
    $('#chats').prepend($chatsToPrepend.children());
  },
  addMessage: function(message) {
    app.addRoom(message.roomname);
    var $chat = $('<div class = "chat" id = ' + _.escape(message.objectId) + '></div>');
    $chat.append('<span class = "post">' + _.escape(message.text) + '</span>');
    $chat.append('<span class = "username">' + _.escape(message.username) + '</span>');
    return $chat;
  },
  clearMessages: function() {
    $('#chats').children().remove();
  },
  addRoom: function(room) {
    room = _.escape(room);
    if(app.rooms[room]){
      app.rooms[room]++;
    } else if(room.replace(/\s/g, '').length){
      app.rooms[room] = 1;
      $('#roomSelect').append('<option value="' + room + '" selected>' + room + '</option>');
    }
  },
  addFriend: function(username) {
    console.log('adding new friend: ' + username.textContent);
  },
  handleSubmit: function(post) {
    var message = {
      text: post.find('#message')[0].value,
      roomname: post.find('#roomSelect')[0].value,
      username: decodeURIComponent(window.location.search.slice(window.location.search.indexOf('=') + 1))
    }
    app.send(message);
  }
};

$( document ).ready(function(){
  $('#chats').on('click', '.username', function(){
    app.addFriend(this);
  });
  $('#send').on('submit', function(event){
    event.preventDefault();
    app.handleSubmit($(this));
  })
  setInterval(app.fetch, 1000);
});

app.fetch();