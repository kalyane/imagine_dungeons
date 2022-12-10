import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'
import * as THREE from '/build/three.module.js'

export default class AIInput extends EventEmitter
{
    constructor(character)
    {
        super()
        this.experience = new Experience()
        this.character = character
        this.shortestDistance = 10

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false
        }
    }

    update(){
      if(this.experience.world.playing && this.character.life>0){
        console.log("here")
        this.checkInput()
      }
    }

    clearInput(){
      // clear all input
      for (var key in this.keys){
        this.keys[key] = false
      }
    }

    checkInput(){
      var previousKeys = {...this.keys}
      this.clearInput()

      // get position characters
      let charPos = this.character.modelDragBox.position
      let playerPos = this.experience.world.player.modelDragBox.position

      var raycaster = new THREE.Raycaster()
      var direction = new THREE.Vector3()
      this.character.model.getWorldDirection(direction)

      raycaster.set(charPos, direction.normalize());
      
      // find distance from player
      let distance = charPos.distanceTo(playerPos)

      if (distance < this.shortestDistance){
        if (this.checkCollisions()){
          this.keys.space = true
        }else{
          var intersect = raycaster.intersectObject(this.experience.world.player.modelDragBox);
          if (intersect.length == 1){
            // if player in same direction go ahead
            this.keys.forward = true
          }else{
            // turn a little
            // TODO: find shortest way to turn
            this.keys.right = true
          }
        }
      }
      if (previousKeys != this.keys)
      {
        this.trigger('keyDown')
      }
    }

    checkCollisions()
    {
        let modelBox = new THREE.Box3();
        modelBox.copy(this.character.modelDragBox.geometry.boundingBox);
        modelBox.applyMatrix4(this.character.modelDragBox.matrixWorld);

        var otherModel = this.experience.world.player
        let otherBox = new THREE.Box3();
        otherBox.copy(otherModel.modelDragBox.geometry.boundingBox);
        otherBox.applyMatrix4(otherModel.modelDragBox.matrixWorld);
        if (modelBox.intersectsBox(otherBox)){
            return true
        }
        return false
    }

}