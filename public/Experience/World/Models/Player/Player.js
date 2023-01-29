import * as THREE from '/build/three.module.js'
import Experience from '../../../Experience.js'
import PlayerControl from './PlayerControl.js'

export default class Player
{
    static type = "player";
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.life = 100
        this.world = this.experience.world
        this.strength = 50
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
    }

    setAnimation(animations)
    {
        // dict of animation
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        //order is:
        //attack, death, idle, impact, run backward, run forward, t-pose, walk backward, walk forward
        
        // Actions
        this.animation.actions = {} 
        this.animation.actions.attack = this.animation.mixer.clipAction(animations[0])
        this.animation.actions.attack.timeScale = 2;
        //this.animation.actions.attack.setLoop(THREE.LoopOnce);
        this.animation.actions.death = this.animation.mixer.clipAction(animations[1])
        this.animation.actions.death.setLoop(THREE.LoopOnce);
        this.animation.actions.death.clampWhenFinished = true
        this.animation.actions.idle = this.animation.mixer.clipAction(animations[2])
        this.animation.actions.impact = this.animation.mixer.clipAction(animations[3])
        this.animation.actions.run_backward = this.animation.mixer.clipAction(animations[4])
        this.animation.actions.run_forward = this.animation.mixer.clipAction(animations[5])
        this.animation.actions.t_pose = this.animation.mixer.clipAction(animations[6])
        this.animation.actions.walk_backward = this.animation.mixer.clipAction(animations[7])
        this.animation.actions.walk_forward = this.animation.mixer.clipAction(animations[8])

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
    }

    delete()
    {
        this.scene.remove(this.model)
        this.scene.remove(this.modelDragBox)
        this.scene.remove(this.boxHelper)
    }

    

    setControl(){
        this.controls = new PlayerControl(this)
    }
}