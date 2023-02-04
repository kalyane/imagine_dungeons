import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from '../../../Experience.js'

/**
 * class used to get keyboard input and translate into the game keys
 */
export default class MonsterControl
{
    constructor(model)
    {
        this.experience = new Experience()
        this.time = this.experience.time
        this.world = this.experience.world

        // constants
        this.fadeDuration = 0.2;
        this.velocity = 10;
        this.shortestDistance = 10;

        // use model to change animation
        this.model = model;
        // use modelDragBox to change position
        this.modelDragBox = this.model.modelDragBox;

        this.dead = false

        this.attackStartTime = 0;

        this.states = {
            IDLE: 'IDLE',
            WALKING: 'WALKING',
            ATTACKING: 'ATTACKING',
            DANCING: 'DANCING',
            DYING: 'DYING'
        }
    }

    playerNear(){
        const raycaster = new THREE.Raycaster();

        for (var i=0; i<this.world.directions.length; i++){
            raycaster.set(this.modelDragBox.position, this.world.directions[i], 0, this.shortestDistance);

            const intersects = raycaster.intersectObjects(this.world.assetsDragBox)

            if (intersects.length > 0 && intersects[0].distance < this.shortestDistance && intersects[0].object == this.world.player.modelDragBox){
                return true
            }
        }

        return false
    }

    checkState(){
        if (this.model.life <= 0){
            this.currentState = this.states.DYING;
        } else if (this.world.player.life <= 0) {
            this.currentState = this.states.DANCING;
        } else if (this.world.checkCollision(this, this.world.player)) {
            this.currentState = this.states.ATTACKING;
        } else if (this.playerNear()) {
            this.currentState = this.states.WALKING;
        } else {
            this.currentState = this.states.IDLE;
        }
    }

    stateActions(){
        switch(this.currentState) {
            case this.states.IDLE:
                this.playAnimation(this.model.animation.actions.idle);
                break;

            case this.states.DANCING:
                this.playAnimation(this.model.animation.actions.dance);
                break;

            case this.states.WALKING:
                this.modelDragBox.lookAt(this.world.player.modelDragBox.position);
                this.move(this.velocity)
                this.playAnimation(this.model.animation.actions.move);
                break;

            case this.states.ATTACKING:
                this.modelDragBox.lookAt(this.world.player.modelDragBox.position);
                play = this.model.animation.actions.attack;

                if (!play.isRunning()) {
                    this.attackStartTime = this.time.current;
                } else {
                    let elapsedTime = this.time.current - this.attackStartTime;
                    if (elapsedTime > play._clip.duration * 1000) {
                        this.experience.world.player.life -= this.model.strength;
                        this.attackStartTime = this.time.current;
                    }
                }

                this.playAnimation(play)
                break;

            case this.states.DYING:
                var play = this.model.animation.actions.death;
                
                setTimeout(() => {
                    if (!this.dead){
                        this.world.player.xp += this.model.maxLife
                        this.dead = true
                        this.world.deleteModel(this.model.unique_name)
                    }
                 }, (play._clip.duration+0.5) * 1000);
                this.playAnimation(play)
                break;
        }
    }

    move(velocity){
        var copyBox = new THREE.Mesh()
        copyBox.copy(this.modelDragBox)
        this.modelDragBox.translateZ(velocity * this.delta);
        if(!this.world.canMove(this.modelDragBox)){
            this.modelDragBox.copy(copyBox)
        } else {
            this.experience.world.checkBoundaries(this.modelDragBox)
        }
    }

    update(delta) {
        this.delta = delta
        this.checkState()
        this.stateActions()
    }

    playAnimation(play){
        if (this.model.animation.actions.current != play) {
            this.model.animation.actions.current.fadeOut(this.fadeDuration);
            play.reset().fadeIn(this.fadeDuration).play();
            this.model.animation.actions.current = play;
        }
    
        this.model.animation.mixer.update(this.delta);
    }
}