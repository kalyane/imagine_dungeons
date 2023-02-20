import MessageHandler from "./MessageHandler";

var message_handler = new MessageHandler()

if (window.messages){
    for (var i = 0; i < window.messages.length; i++){
        message_handler.addMessage(window.messages[i])            
    }
}

message_handler.showMessages()