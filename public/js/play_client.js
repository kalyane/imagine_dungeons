import Experience from '../Experience/Experience.js'
import MessageHandler from "./MessageHandler";

var message_handler = new MessageHandler()

// Create a new instance of Experience, passing in a canvas element
const experience = new Experience(document.querySelector('canvas#playCanvas'))

// Make the experience instance available globally
window.experience = experience;

// Listen for 'message' events on the experience instance
experience.on('message', () => {
    // Add each message to the message handler's message list
    for (var i = 0; i < experience.messages.length; i++){
        message_handler.addMessage(experience.messages[i])
    }
    // Clear the experience's message list
    experience.messages = []
    // Show the messages using the message handler
    message_handler.showMessages()
});

// Set the assets and game variables from the window object
let assets = window.assets;
var game = window.game;

// Call the setExperienceAttributes function to initialize the experience
setExperienceAttributes()

function setExperienceAttributes(){
    // Set the attributes of the experience instance
    experience.setAttributes(assets, {'x': game.size_x*2,'z': game.size_z*2}, true, true)
    
    // Listen for the 'ready' event on the world object
    experience.world.on('ready', async () => {
        experience.reset()

        experience.ready = true;
        experience.trigger("ready");
    });

    // keep listening to when an asset is being transformed
    experience.world.on('start_transform', () => {
        selectAssetCard()
    });

    // when no asset is being transformed
    experience.world.on('stop_transform', () => {
        unselect()
    });

    // update metrics on every tick
    experience.time.on('tick', () =>
    {
        var life = document.getElementById("life");
        life.innerHTML = experience.metrics.life

        var xp = document.getElementById("xp");
        xp.innerHTML = experience.metrics.xp

        var level = document.getElementById("level");
        level.innerHTML = experience.metrics.level

        var defense = document.getElementById("defense");
        defense.innerHTML = experience.metrics.defense

        var attack = document.getElementById("attack");
        attack.innerHTML = experience.metrics.attack

        var time = document.getElementById("time");
        time.innerHTML = experience.metrics.time

        var key = document.getElementById("key");
        key.innerHTML = experience.metrics.key

        var container = document.getElementById("game_over_container");
        container.className = '';
        var over = document.getElementById("over");
        if (experience.metrics.over == "lost") {
            over.innerHTML = "You Lost"
            container.classList.add("lose")
        } else if (experience.metrics.over == "won") {
            over.innerHTML = "You Won"
            container.classList.add("win")
        } else if (experience.metrics.over == "no_way") {
            over.innerHTML = "No Way to Win"
            container.classList.add("no_way")
        }
    })
}