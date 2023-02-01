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
        this.world = this.experience.world

        // constants
        this.fadeDuration = 0.2;
        this.runVelocity = 25;
        this.walkVelocity = 15;
        this.rotation = 0.025;

        // use model to change animation
        this.model = model;
        // use modelDragBox to change position
        this.modelDragBox = this.model.modelDragBox;

        // state machine
        // enumeration of all the possible states
        this.states = {
            IDLE: 'IDLE',
            WALKING: 'WALKING',
            RUNNING: 'RUNNING',
            ROTATING_LEFT: 'ROTATING_LEFT',
            ROTATING_RIGHT: 'ROTATING_RIGHT',
            WALKING_AND_ROTATING_LEFT: 'WALKING_AND_ROTATING_LEFT',
            WALKING_AND_ROTATING_RIGHT: 'WALKING_AND_ROTATING_RIGHT',
            RUNNING_AND_ROTATING_LEFT: 'RUNNING_AND_ROTATING_LEFT',
            RUNNING_AND_ROTATING_RIGHT: 'RUNNING_AND_ROTATING_RIGHT',
            ATTACKING: 'ATTACKING',
            DYING: 'DYING',
            INTERACTING: 'INTERACTING'
        }

        this.isAttaking = false
        this.dead = false

        // state
        this.toggleRun = true;

        this.currentState =  this.states.IDLE;

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

    checkState(){
        // check if player died
        if (this.model.life <= 0){
            this.currentState = this.states.DYING;
        } else if (this.keysPressed['e']) {
            this.currentState = this.states.INTERACTING;
        } else if (this.keysPressed[' '] || this.isAttaking) {
            this.currentState = this.states.ATTACKING;
        } else if (this.keysPressed['w'] && this.keysPressed['a'] && this.toggleRun) {
            this.currentState = this.states.RUNNING_AND_ROTATING_LEFT;
        } else if (this.keysPressed['w'] && this.keysPressed['d'] && this.toggleRun) {
            this.currentState = this.states.RUNNING_AND_ROTATING_RIGHT;
        } else if (this.keysPressed['w'] && this.keysPressed['a']) {
            this.currentState = this.states.WALKING_AND_ROTATING_LEFT;
        } else if (this.keysPressed['w'] && this.keysPressed['d']) {
            this.currentState = this.states.WALKING_AND_ROTATING_RIGHT;
        } else if (this.keysPressed['w'] && this.toggleRun) {
            this.currentState = this.states.RUNNING;
        } else if (this.keysPressed['w']) {
            this.currentState = this.states.WALKING;
        } else if (this.keysPressed['a']) {
            this.currentState = this.states.ROTATING_LEFT;
        } else if (this.keysPressed['d']) {
            this.currentState = this.states.ROTATING_RIGHT;
        } else {
            this.currentState = this.states.IDLE;
        }
    }

    stateActions(){
        switch(this.currentState) {
            case this.states.IDLE:
                this.playAnimation(this.model.animation.actions.idle);
                break;

            case this.states.WALKING:
                this.move(this.walkVelocity)
                this.playAnimation(this.model.animation.actions.walk_forward);
                break;

            case this.states.RUNNING:
                this.move(this.runVelocity)
                this.playAnimation(this.model.animation.actions.run_forward);
                break;

            case this.states.ROTATING_LEFT:
                this.modelDragBox.rotateY(this.rotation);
                this.playAnimation(this.model.animation.actions.walk_forward);
                break;

            case this.states.ROTATING_RIGHT:
                this.modelDragBox.rotateY(-this.rotation);
                this.playAnimation(this.model.animation.actions.walk_forward);
                break;

            case this.states.WALKING_AND_ROTATING_LEFT:
                this.modelDragBox.rotateY(this.rotation);
                this.move(this.walkVelocity)
                this.playAnimation(this.model.animation.actions.walk_forward);
                break;

            case this.states.WALKING_AND_ROTATING_RIGHT:
                this.modelDragBox.rotateY(-this.rotation);
                this.move(this.walkVelocity)
                this.playAnimation(this.model.animation.actions.walk_forward);
                break;

            case this.states.RUNNING_AND_ROTATING_LEFT:
                this.modelDragBox.rotateY(this.rotation);
                this.move(this.runVelocity)
                this.playAnimation(this.model.animation.actions.run_forward);
                break;

            case this.states.RUNNING_AND_ROTATING_RIGHT:
                this.modelDragBox.rotateY(-this.rotation);
                this.move(this.runVelocity)
                this.playAnimation(this.model.animation.actions.run_forward);
                break;

            case this.states.ATTACKING:
                var play = this.model.animation.actions.attack;
                if (!play.isRunning()) {
                    this.attackStartTime = this.time.current;
                    this.isAttaking = true
                } 
                var elapsedTime = this.time.current - this.attackStartTime;
                if (elapsedTime > play._clip.duration/play.timeScale * 1000) {
                    this.endAttack()
                    play = this.model.animation.actions.idle;
                    this.isAttaking = false
                }
                this.playAnimation(play)
                break;

            case this.states.DYING:
                this.playAnimation(this.model.animation.actions.death)

                this.dead = true
                this.experience.gameOver = true // game ends when player dies
                
                break;

            case this.states.INTERACTING:
                this.playAnimation(this.model.animation.actions.idle);
                this.interact()
                break;
        }
    }

    interact(){
        const raycaster = new THREE.Raycaster();
        var radius = 2

        for (var i=0; i<this.world.directions.length; i++){
            raycaster.set(this.modelDragBox.position, this.world.directions[i], 0, 10);

            const intersects = raycaster.intersectObjects(this.world.interactableModels);

            // if there is a solid distance less than radius, player can't move
            if (intersects.length > 0 && intersects[0].distance < radius){
                this.world.dictModels[intersects[0].object.userData].interact()
                return;
            }
        }
    }

    endAttack()
    {
        for (var i=0; i<this.world.monsters.length; i++){
            if (this.world.checkCollision(this, this.world.monsters[i])){
                this.world.monsters[i].life -= this.model.strength
                break;
            }
        }
    }

    playAnimation(play){
        if (this.model.animation.actions.current != play) {
            this.model.animation.actions.current.fadeOut(this.fadeDuration);
            play.reset().fadeIn(this.fadeDuration).play();
            this.model.animation.actions.current = play;
        }
    
        this.model.animation.mixer.update(this.delta);
    }

    update(delta) {
        this.delta = delta
        this.checkState()
        this.stateActions()
    }

    move(velocity){
        var copyBox = new THREE.Mesh()
        copyBox.copy(this.modelDragBox)
        this.modelDragBox.translateZ(-velocity * this.delta);
        if(!this.world.canMove(this.modelDragBox)){
            this.modelDragBox.copy(copyBox)
        } else {
            this.experience.world.checkBoundaries(this.modelDragBox)
        }
    }
}