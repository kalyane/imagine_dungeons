import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from '../../../Experience.js'
import MonsterControl from './MonsterControl.js'

export default class Monster
{
    static type = "monster";
    constructor()
    {
        // general experience
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time

        this.attack_range = 10;

    }

    setModel()
    {
        // set shadow property
        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })
        
        // sets previous position for the current one
        this.previousPosition = [new THREE.Vector3().copy(this.modelDragBox.position)]

        // creates a box to help positioning when editing
        this.boxHelper = new THREE.BoxHelper(this.modelDragBox, 0xffff00)
        this.boxHelper.visible = false

        // saves an argument referencing the name of the model for easy access later
        this.model.userData = this.unique_name
        this.modelDragBox.userData = this.unique_name
        this.boxHelper.userData = this.unique_name

        // adds objects to the scene
        this.scene.add(this.modelDragBox)
        this.scene.add(this.boxHelper)
        this.scene.add(this.model)

        if (this.experience.playing){
            this.setLifeBar()
        }
        
    }

    setLifeBar(){
        // Create the canvas and context
        this.canvas = new OffscreenCanvas(100, 10);
        this.context = this.canvas.getContext('2d');
      
        // Draw the life bar
        this.context.fillStyle = 'green';
        this.context.fillRect(0, 0, this.canvas.width * (this.life / this.maxLife), this.canvas.height);
        this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
      
        // Create a texture from the canvas
        const texture = new THREE.CanvasTexture(this.canvas);
      
        // Create a sprite using the texture
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        this.sprite = new THREE.Sprite(spriteMaterial);
      
        this.sprite.scale.set(this.canvas.width / 20, this.canvas.height / 20, 1);
      
        // Add the sprite to the scene
        this.scene.add(this.sprite);
      }

    updateLifeBar() {
        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
        // Draw the updated life bar
        this.context.fillStyle = 'green';
        this.context.fillRect(0, 0, this.canvas.width * (this.life / this.maxLife), this.canvas.height);
        this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
      
        // Update the texture
        this.sprite.material.map.needsUpdate = true;

        // Place the sprite on top of the monster
        this.sprite.position.set(this.modelDragBox.position.x, this.modelDragBox.position.y + this.modelDragBox.geometry.boundingBox.max.y + 2, this.modelDragBox.position.z);

      }

    setAnimation(animations)
    {
        // dict of animation
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        //order is:
        // Bite_Front, Bite_InPlace, Dance, Death, HitRecieve, Idle, Jump, No, Walk, Yes
        
        // Actions
        this.animation.actions = {} 
        this.animation.actions.idle = null
        this.animation.actions.dance = null

        for (var i=0; i < animations.length; i++){
            if (animations[i].name == "Walk" || animations[i].name == "Flying"){
                this.animation.actions.move = this.animation.mixer.clipAction(animations[i])
                if (this.animation.actions.idle == null){
                    this.animation.actions.idle = this.animation.mixer.clipAction(animations[i])
                    this.animation.actions.dance = this.animation.mixer.clipAction(animations[i])
                }
            } else if (animations[i].name == "Idle"){
                this.animation.actions.idle = this.animation.mixer.clipAction(animations[i])
            } else if (animations[i].name == "Bite_Front"){
                this.animation.actions.attack = this.animation.mixer.clipAction(animations[i])
            } else if (animations[i].name == "HitRecieve"){
                this.animation.actions.hit = this.animation.mixer.clipAction(animations[i])
            } else if (animations[i].name == "Death"){
                this.animation.actions.death = this.animation.mixer.clipAction(animations[i])
            } else if (animations[i].name == "Dance"){
                this.animation.actions.dance = this.animation.mixer.clipAction(animations[i])
            }
        }

        this.animation.actions.death.setLoop(THREE.LoopOnce);
        this.animation.actions.death.clampWhenFinished = true
        
        // initial animation
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()
    }

    // Play the action
    playAnimation(name)
    {
        const newAction = this.animation.actions[name]
        const oldAction = this.animation.actions.current

        // only change animation if it is different than current
        if (newAction != oldAction){
            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }
    }

    update()
    {
        if (this.controls) this.controls.update(this.experience.time.delta * 0.001)
        this.model.position.copy(this.modelDragBox.position)
        this.model.rotation.copy(this.modelDragBox.rotation)
        this.boxHelper.update()

        if (this.experience.playing){
            this.updateLifeBar()
        }
    }

    delete()
    {
        this.scene.remove(this.sprite)
        this.scene.remove(this.model)
        this.scene.remove(this.modelDragBox)
        this.scene.remove(this.boxHelper)
    }

    checkCollisions(objects)
    {
        // manually calculate intersection
        let modelBox = new THREE.Box3();
        modelBox.copy(this.modelDragBox.geometry.boundingBox);
        modelBox.applyMatrix4(this.modelDragBox.matrixWorld);

        for(var i=0; i<objects.length; i++) {
            var otherModel = objects[i]
            let otherBox = new THREE.Box3();
            otherBox.copy(otherModel.modelDragBox.geometry.boundingBox);
            otherBox.applyMatrix4(otherModel.modelDragBox.matrixWorld);
            if (modelBox.intersectsBox(otherBox)){
                return true
            }
        }
        return false
    }

    setControl(){
        this.controls = new MonsterControl(this)
    }
}