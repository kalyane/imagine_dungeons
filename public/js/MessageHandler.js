export default class MessageHandler
{
    constructor()
    {
      this.messages = []
      
      this.icon_class = {
        "error" : "fa-times-circle",
        "success" : "fa-check-circle",
        "warning" : "fa-exclamation-circle",
        "info" : "fa-info-circle"
      }

      this.messagesContainer = document.createElement("div");
      this.messagesContainer.classList.add('alerts-container');
      this.messagesContainer.style.visibility = "hidden"
      document.body.appendChild(this.messagesContainer);
    }

    addMessage(message){
      this.messages.push(message)
    }

    showMessages(){
      this.messagesContainer.style.visibility = "visible"
      for (var i = 0; i < this.messages.length; i++){
        this.createMessage(this.messages[i])
      }

      this.messages = []
    }

    createMessage(message){
      var messageContainer = document.createElement("div");
      messageContainer.classList.add('alert');
      messageContainer.classList.add(message.type);

      var messageContent = document.createElement("div");
      messageContent.classList.add('alert-content');

      var messageIcon = document.createElement("i");
      messageIcon.classList.add('type-icon');
      messageIcon.classList.add('fas');
      messageIcon.classList.add(this.icon_class[message.type]);

      var text = document.createTextNode(message.text);

      messageContent.appendChild(messageIcon);
      messageContent.appendChild(text);

      messageContainer.appendChild(messageContent);

      if (message.button){
        var button = document.createElement("a");
        button.classList.add('message-button');
        var buttonText = document.createTextNode(message.button.text);
        button.appendChild(buttonText)
        button.setAttribute("href", message.button.href)
        messageContainer.appendChild(button);
      } else {
        var closeIcon = document.createElement("i");
        closeIcon.classList.add('close-icon');
        closeIcon.classList.add('fas');
        closeIcon.classList.add("fa-times");

        messageContainer.appendChild(closeIcon);

        closeIcon.addEventListener("click", () => {
          messageContainer.remove()
          if (this.messagesContainer.childNodes.length == 0){
            this.messagesContainer.style.visibility = "hidden"
          }
        })
      }

      this.messagesContainer.appendChild(messageContainer);

    }
}