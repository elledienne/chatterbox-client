// YOUR CODE HERE:
var app = {
  lastMessage: null,
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
    var $chat = $('<div class = "chat" id = ' + _.escape(message.objectId) + '></div>');
    $chat.append('<span class = "post">' + _.escape(message.text) + '</span>');
    $chat.append('<span class = "username">' + _.escape(message.username) + '</span>');
    return $chat;
  },
  clearMessages: function() {
    $('#chats').children().remove();
  },
  addRoom: function(room) {
    $('#roomSelect').append('<option value="' + room + '" selected>' + room + '</option>');
  },
  addFriend: function(username) {
    console.log('adding new friend: ' + username.textContent);
  },
  handleSubmit: function(post) {
    console.log(post);
  }
};

$( document ).ready(function(){
  $('#chats').on('click', '.username', function(){
    app.addFriend(this);
  });
  $('.submit').on('submit', function(e){
    app.handleSubmit(this);
  })
  setInterval(app.fetch, 1000);
});

app.fetch();