export default class MessageHandler
{
    constructor()
    {
      // Initialize the messages array
      this.messages = []
      
      // Define a mapping of message types to icon classes
      this.icon_class = {
        "error" : "fa-times-circle",
        "success" : "fa-check-circle",
        "warning" : "fa-exclamation-circle",
        "info" : "fa-info-circle"
      }

      // Create a container to hold the messages and add it to the HTML body
      this.messagesContainer = document.createElement("div");
      this.messagesContainer.classList.add('alerts-container');
      this.messagesContainer.style.visibility = "hidden"
      document.body.appendChild(this.messagesContainer);
    }

    // Add a new message to the messages array
    addMessage(message){
      this.messages.push(message)
    }

    // Show all the messages in the messages array
    showMessages(){
      // Make the messages container visible
      this.messagesContainer.style.visibility = "visible"
      // Iterate through all the messages and create message elements for each one
      for (var i = 0; i < this.messages.length; i++){
        this.createMessage(this.messages[i])
      }
      // Clear the messages array
      this.messages = []
    }

    // Create a new message element with a type, content, and optionally a button
    createMessage(message){
      // Create a div to hold the message and set its classes based on the message type
      var messageContainer = document.createElement("div");
      messageContainer.classList.add('alert');
      messageContainer.classList.add(message.type);

      // Create a div to hold the message content
      var messageContent = document.createElement("div");
      messageContent.classList.add('alert-content');

      // Create an icon element for the message type
      var messageIcon = document.createElement("i");
      messageIcon.classList.add('type-icon');
      messageIcon.classList.add('fas');
      messageIcon.classList.add(this.icon_class[message.type]);

      // Create a text node for the message content
      var text = document.createTextNode(message.text);

      // Add the icon and text to the message content div
      messageContent.appendChild(messageIcon);
      messageContent.appendChild(text);

      messageContainer.appendChild(messageContent);

      // If the message has a button, add an anchor element to the message
      if (message.button){
        var button = document.createElement("a");
        button.classList.add('message-button');
        var buttonText = document.createTextNode(message.button.text);
        button.appendChild(buttonText)
        button.setAttribute("href", message.button.href)
        messageContainer.appendChild(button);
      } 
      // If the message does not have a button, add a close icon
      else {
        var closeIcon = document.createElement("i");
        closeIcon.classList.add('close-icon');
        closeIcon.classList.add('fas');
        closeIcon.classList.add("fa-times");

        // Add the close icon to the message container
        messageContainer.appendChild(closeIcon);

        // Add a click event listener to the close icon to remove the message and hide the messages container if it is empty
        closeIcon.addEventListener("click", () => {
          messageContainer.remove()
          if (this.messagesContainer.childNodes.length == 0){
            this.messagesContainer.style.visibility = "hidden"
          }
        })
      }

      // Add the message container to the messages container
      this.messagesContainer.appendChild(messageContainer);

    }
}