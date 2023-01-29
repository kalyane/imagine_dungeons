import * as THREE from '/build/three.module.js'
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
        // get position characters
        let monsterPos = this.modelDragBox.position
        let playerPos = this.world.player.modelDragBox.position

        var raycaster = new THREE.Raycaster()
        var direction = new THREE.Vector3()
        this.model.model.getWorldDirection(direction)

        raycaster.set(monsterPos, direction.normalize());
        
        // find distance from player
        var distance = monsterPos.distanceTo(playerPos)
        if (distance <= this.shortestDistance){
            return true
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
                // make a copy of the model drag box
                let copyBox = new THREE.Mesh()
                copyBox.copy(this.modelDragBox)
                
                // move the model drag box
                this.modelDragBox.translateZ(this.velocity * this.delta);

                // check if the new position is valid
                if(!this.checkMovement(this.modelDragBox)){
                    this.modelDragBox.copy(copyBox)
                } else {
                    // world boundaries
                    this.experience.world.map.checkBoundaries(this.modelDragBox)
                }
                this.playAnimation(this.model.animation.actions.walk);
                break;

            case this.states.ATTACKING:
                this.modelDragBox.lookAt(this.world.player.modelDragBox.position);
                play = this.model.animation.actions.bite_front;

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
                        this.dead = true
                        this.world.deleteModel(this.model.unique_name)
                    }
                 }, (play._clip.duration+0.5) * 1000);
                this.playAnimation(play)
                break;
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