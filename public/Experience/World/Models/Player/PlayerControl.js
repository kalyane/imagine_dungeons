import * as THREE from '/build/three.module.js'
import Experience from '../../../Experience.js'

/**
 * class used to get keyboard input and translate into the game keys
 */
export default class PlayerControl
{
    constructor(model)
    {
        this.experience = new Experience()
        this.time = this.experience.time

        // state
        this.toggleRun = true;

        // keys
        this.directions = ['w', 'a', 'd']

        // temporary data
        this.walkDirection = new THREE.Vector3();
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.rotateQuarternion = new THREE.Quaternion();
        this.idealOffset = new THREE.Vector3(-3, 8, -12)

        // constants
        this.fadeDuration = 0.2;
        this.runVelocity = 20;
        this.walkVelocity = 5;

        // use model to change animation
        this.model = model;
        // use modelDragBox to change position
        this.modelDragBox = this.model.modelDragBox;

        // check if key was pressed or released
        this.keysPressed = {};
        document.addEventListener('keydown', (event) => {
            if (event.shiftKey) {
                this.switchRunToggle();
            }
            else {
              this.keysPressed[event.key.toLowerCase()] = true;
            }
        }, false);

        document.addEventListener('keyup', (event) => {
          this.keysPressed[event.key.toLowerCase()] = false;
        }, false);

    }

    switchRunToggle(){
      this.toggleRun = !this.toggleRun;
    }

    update(delta) {
        var play;

        // check if player died
        if (this.model.life <= 0){
            play = this.model.animation.actions.death;
            if (!play.isRunning()) {
                this.deathStartTime = this.time.current;
            } 
            let elapsedTime = this.time.current - this.deathStartTime;
            if (elapsedTime > play._clip.duration * 1000) {
                console.log("died")
            }
        }

        else {
            // check if any of the movement keys are pressed
            var directionPressed = this.directions.some( (key) => {return this.keysPressed[key] == true;});
            let velocity;
            if (this.toggleRun) {
                velocity = this.runVelocity;
            } else {
                velocity = this.walkVelocity;
            }
        
            // update the animation based on the keys pressed
            if (directionPressed && this.toggleRun) {
                play = this.model.animation.actions.run_forward;
            }
            else if (directionPressed) {
                play = this.model.animation.actions.walk_forward;
            }
            else {
                play = this.model.animation.actions.idle;
            }

            // update the player's position based on the keys pressed
            if (this.keysPressed['w']) {
                // make a copy of the model drag box
                let copyBox = new THREE.Mesh()
                copyBox.copy(this.modelDragBox)
                
                // move the model drag box
                this.modelDragBox.translateZ(-velocity * delta);

                // check if the new position is valid
                if(!this.checkMovement(this.modelDragBox)){
                    this.modelDragBox.copy(copyBox)
                } else {
                    // world boundaries
                    this.experience.world.map.checkBoundaries(this.modelDragBox)
                }
            }
        
            if (this.keysPressed['a']) {
                this.modelDragBox.rotateY(0.025);
            }
            else if (this.keysPressed['d']) {
                this.modelDragBox.rotateY(-0.025);
            }
        }
        
        if (this.model.animation.actions.current != play) {
            this.model.animation.actions.current.fadeOut(this.fadeDuration);
            play.reset().fadeIn(this.fadeDuration).play();
            this.model.animation.actions.current = play;
        }
    
        this.model.animation.mixer.update(delta);
    }

    // Function to check if the square can move to the new position
    checkMovement(box) {
        let bb = box.geometry.boundingBox
        
        var maxX = Math.round(box.position.x+bb.max.x+this.experience.world.gridSize.x/2)
        var minX = Math.round(box.position.x+bb.min.x+this.experience.world.gridSize.x/2)
        var maxZ = Math.round(box.position.z+bb.max.z+this.experience.world.gridSize.z/2)
        var minZ = Math.round(box.position.z+bb.min.z+this.experience.world.gridSize.z/2)

        // Nested loop to iterate over the cells in the bounding box
        for (let x = minX*2; x <= Math.min(maxX*2, this.experience.world.gridSize.x*2-1); x++) {
            for (let z = minZ*2; z <= Math.min(maxZ*2, this.experience.world.gridSize.z*2-1); z++) {
                // Check if the cell value is 0
                if (this.experience.world.map.matrix[x][z] === 0) {
                    // The square cannot move to the new position
                    return false;
                }
            }
        }
    
        // The square can move to the new position
        return true;
    }
}