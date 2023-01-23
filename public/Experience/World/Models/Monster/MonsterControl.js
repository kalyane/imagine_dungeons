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

        // constants
        this.fadeDuration = 0.2;
        this.velocity = 10;
        this.shortestDistance = 10;

        // use model to change animation
        this.model = model;
        // use modelDragBox to change position
        this.modelDragBox = this.model.modelDragBox;

        this.attackStartTime = 0;

    }
  
      checkCollisions()
      {
          let modelBox = new THREE.Box3();
          modelBox.copy(this.modelDragBox.geometry.boundingBox);
          modelBox.applyMatrix4(this.modelDragBox.matrixWorld);
  
          var otherModel = this.experience.world.player
          let otherBox = new THREE.Box3();
          otherBox.copy(otherModel.modelDragBox.geometry.boundingBox);
          otherBox.applyMatrix4(otherModel.modelDragBox.matrixWorld);
          if (modelBox.intersectsBox(otherBox)){
              return true
          }
          return false
      }

    update(delta) {
        var play = this.model.animation.actions.idle;

        // get position characters
        let monsterPos = this.modelDragBox.position
        let playerPos = this.experience.world.player.modelDragBox.position
  
        var raycaster = new THREE.Raycaster()
        var direction = new THREE.Vector3()
        this.model.model.getWorldDirection(direction)
  
        raycaster.set(monsterPos, direction.normalize());
        
        // find distance from player
        let distance = monsterPos.distanceTo(playerPos)
        
        if (distance < this.shortestDistance){
            if (this.checkCollisions()){
                // attack
                play = this.model.animation.actions.bite_front;

                if (!play.isRunning()) {
                    this.attackStartTime = this.time.current;
                } else {
                    let elapsedTime = this.time.current - this.attackStartTime;
                    if (elapsedTime > play._clip.duration * 1000) {
                        this.experience.world.player.life -= 10;
                        this.attackStartTime = this.time.current;
                    }
                }
            }else{
                var intersect = raycaster.intersectObject(this.experience.world.player.modelDragBox);
                // if player in same direction go ahead
                if (intersect.length == 1){
                    // walk animation
                    play = this.model.animation.actions.walk;
                    // make a copy of the model drag box
                    let copyBox = new THREE.Mesh()
                    copyBox.copy(this.modelDragBox)
                    
                    // move the model drag box
                    this.modelDragBox.translateZ(this.velocity * delta);

                    // check if the new position is valid
                    if(!this.checkMovement(this.modelDragBox)){
                        this.modelDragBox.copy(copyBox)
                    } else {
                        // world boundaries
                        this.experience.world.map.checkBoundaries(this.modelDragBox)
                    }
                }else{
                    // turn a little
                    this.modelDragBox.rotateY(0.025);
                }
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