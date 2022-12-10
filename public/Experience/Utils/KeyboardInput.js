import EventEmitter from './EventEmitter.js'

/**
 * class used to get keyboard input and translate into the game keys
 */
export default class KeyboardInput extends EventEmitter
{
    constructor()
    {
        super()

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false
        }

        // check if key was pressed or released
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event) {
        let code = event.keyCode || event.which
        switch (code) {
          case 87: // w
            this.keys.forward = true;
            break;
          case 65: // a
            this.keys.left = true;
            break;
          case 83: // s
            this.keys.backward = true;
            break;
          case 68: // d
            this.keys.right = true;
            break;
          case 32: // SPACE
            this.keys.space = true;
            break;
          case 16: // SHIFT
            this.keys.shift = true;
            break;
        }

        this.trigger('keyDown')
    }
    
    onKeyUp(event) {
        switch(event.keyCode) {
          case 87: // w
            this.keys.forward = false;
            break;
          case 65: // a
            this.keys.left = false;
            break;
          case 83: // s
            this.keys.backward = false;
            break;
          case 68: // d
            this.keys.right = false;
            break;
          case 32: // SPACE
            this.keys.space = false;
            break;
          case 16: // SHIFT
            this.keys.shift = false;
            break;
        }

        this.trigger('keyUp')
    }
    update(){

    }
}