import Experience from '../Experience/Experience.js'
import MessageHandler from "./MessageHandler";

var message_handler = new MessageHandler()

const experience = new Experience(document.querySelector('canvas#playCanvas'))

window.experience = experience;

experience.on('message', () => {
    for (var i = 0; i < experience.messages.length; i++){
        message_handler.addMessage(experience.messages[i])
    }
    experience.messages = []
    message_handler.showMessages()
});

let assets = window.assets;
var game = window.game;

setExperienceAttributes()

function setExperienceAttributes(){
    experience.setAttributes(assets, {'x': game.size_x*2,'z': game.size_z*2}, {'near': game.near, 'far': game.far} , true, true)
    
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
}