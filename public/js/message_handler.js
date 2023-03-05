import MessageHandler from "./MessageHandler";

var message_handler = new MessageHandler()

// If there are messages in the window object
if (window.messages){
    // Add each message to the message handler's message list
    for (var i = 0; i < window.messages.length; i++){
        message_handler.addMessage(window.messages[i])            
    }
}
// Show the messages using the message handler
message_handler.showMessages()