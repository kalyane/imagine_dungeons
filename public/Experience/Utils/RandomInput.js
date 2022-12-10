import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'

/**
 * Class generates random input of keys to character
 */
export default class RandomInput extends EventEmitter
{
    constructor(character)
    {
        super()
        this.experience = new Experience()
        this.character = character
        this.player = this.experience.world.player
        this.shortestDistance = 10

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false
        }

        this.last = this.experience.time.current
    }

    update(){
      if (Date.now() - this.last > 1000){
        this.randomKey()
        this.last = Date.now()
      } else{
        this.trigger('keyDown')
      }
    }

    randomKey(){
      // clear all input
      for (var key in this.keys){
        this.keys[key] = false
      }
      //this.trigger('keyUp')

      var ks = ['forward', 'backward', 'left', 'right', 'space']
      var k = ks[Math.floor(Math.random()*ks.length)];
      this.keys[k] = true
      this.trigger('keyDown')
    }

}