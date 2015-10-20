// YOUR CODE HERE:
var app = {
  lastMessage: null,
  rooms: {},
  currentSelectedRoom: null,
  friends: {},
  server: 'https://api.parse.com/1/classes/chatterbox',
  init: function() {},
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
    if ($chatsToPrepend.children().length > 0) {
      $('#chats').prepend($chatsToPrepend);
    }
  },
  addMessage: function(message) {
    console.log(message);
    var room = _.escape(message.roomname);
    app.addRoom(room);
    var messageText = _.escape(message.text);
    var userName = _.escape(message.username);
    if(messageText && (app.currentSelectedRoom === null || app.currentSelectedRoom === room)) {
      var $chat = $('<div class = "chat" id = ' + _.escape(message.objectId) + '></div>');
      if (app.friends[userName]) {
        $chat.addClass('friend');
      }
      $chat.append('<span class = "post">' + messageText + '</span>');
      $chat.append('<span class = "username ' + userName + ' ">' + userName + '</span>');
      $chat.append('<span class = "roomname">Room: ' + room + '</span>');
      return $chat;
    }
    return;
  },
  clearMessages: function() {
    $('#chats').children().remove();
  },
  resetMessages: function() {
    app.clearMessages();
    app.lastMessage = null;
    app.fetch();
  },
  addRoom: function(room, selected) {
    selected = selected || '';
    if(app.rooms[room]){
      if(selected) {
        $('option[value = "' + room +'"]').prop('selected', true);
      } else {
        app.rooms[room]++;
      }
    } else if(room.replace(/\s/g, '').length){
      app.rooms[room] = 1;
      $('#roomSelect').append('<option value="' + room + '" ' + selected + '>' + room + '</option>');
    }
  },
  addFriend: function(username) {
    username = username.textContent;
    //console.log('adding new friend: ' + username);
    if (!app.friends[username]) {
      app.friends[username] = 1;
    }
    $('span.username.' + username).parent().addClass('friend');
    //console.dir(app.friends);
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
    //console.log('aaa');
    app.handleSubmit($(this));
    $(this).find('#message')[0].value = '';
  });
  $('#send').on('click', '.setButton', function() {
    var roomName = _.escape($(this).siblings()[0].value)
    app.addRoom(roomName, 'selected');
    app.currentSelectedRoom = roomName;
    $('select').show();
    $('.setNewRoom').hide();
    $('button.submit').prop('disabled', false);
    app.resetMessages();
  });
  $('select').change(function(event){
    var selectedRoom = $('select').find(":selected");
    if (selectedRoom.attr('id') === 'createNewRoom') {
      $('button.submit').prop('disabled', true);
      $('select').hide();
      $('.setNewRoom').show();
    } else {
      if(selectedRoom.attr('id') === 'allRooms') {
        $('button.submit').prop('disabled', true);
        app.currentSelectedRoom = null;
      } else {
        $('button.submit').prop('disabled', false);
        app.currentSelectedRoom = selectedRoom.attr('value');
      }
      app.resetMessages();
    }
  });
  setInterval(app.fetch, 2000);
});

app.fetch();