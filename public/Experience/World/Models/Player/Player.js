import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from '../../../Experience.js'
import PlayerControl from './PlayerControl.js'
import Weapon from '../Weapon/Weapon.js'
//import {GUI} from 'dat.gui'

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
        this.xp = 0
        this.maxLife = this.life
        this.level = 0

        this.attack_weapon = "placeholder"
        this.defense_weapon = "placeholder"
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

        this.rightHand = this.model.getObjectByName("mixamorigRightHandIndex1")
        this.leftForeArm = this.model.getObjectByName("mixamorigLeftForeArm")

        
    }

    setAnimation(animations)
    {
        // dict of animation
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {} 

        for (var i=0; i < animations.length; i++){
            this.animation.actions[animations[i].name] = this.animation.mixer.clipAction(animations[i])
        }

        this.animation.actions.death.setLoop(THREE.LoopOnce);
        this.animation.actions.death.clampWhenFinished = true

        this.animation.actions.attack.timeScale = 2;
        
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

        if (this.xp/100 - (this.level/2 * (2 + (this.level-1))) > this.level){
            this.level += 1
            this.life = this.maxLife
        }
    }

    delete()
    {
        this.scene.remove(this.model)
        this.scene.remove(this.modelDragBox)
        this.scene.remove(this.boxHelper)
    }

    setControl(){
        this.controls = new PlayerControl(this)

        this.setWeapon()
        
    }

    setWeapon(){
        if (this.world.dictModels[this.attack_weapon]){
            this.attack_weapon = this.world.dictModels[this.attack_weapon]
            this.useWeapon(this.attack_weapon)
        } 

        if (this.world.dictModels[this.defense_weapon]){
            this.defense_weapon = this.world.dictModels[this.defense_weapon]
            this.useWeapon(this.defense_weapon)
        } 
        
    }

    useWeapon(weapon){
        if (weapon.attack){
            if (this.attack_weapon.using){
                this.attack_weapon.using = false
                this.attack_weapon.model.visible = true
                this.attack_weapon.modelDragBox.position.copy(this.modelDragBox.position)
                this.rightHand.remove(this.attack_model)
            }

            this.attack_weapon = weapon
            this.attack_weapon.using = true
            

            this.attack_model = this.attack_weapon.model.clone()
            this.attack_weapon.model.visible = false

            this.attack_model.scale.set(30, 30, 30)
            this.attack_model.position.set(this.attack_weapon.offsetPos.x, this.attack_weapon.offsetPos.y, this.attack_weapon.offsetPos.z)
            this.attack_model.rotation.set(this.attack_weapon.offsetRot.x, this.attack_weapon.offsetRot.y, this.attack_weapon.offsetRot.z)
            this.rightHand.add(this.attack_model)
        }

        if (weapon.defense){
            console.log(this.leftForeArm)
            if (this.defense_weapon.using){
                this.defense_weapon.using = false
                this.defense_weapon.model.visible = true
                this.defense_weapon.modelDragBox.position.copy(this.modelDragBox.position)
                this.leftForeArm.remove(this.defense_model)
            }

            this.defense_weapon = weapon
            this.defense_weapon.using = true

            this.defense_model = this.defense_weapon.model.clone()
            this.defense_weapon.model.visible = false

            this.defense_model.scale.set(30, 30, 30)
            this.defense_model.position.set(this.defense_weapon.offsetPos.x, this.defense_weapon.offsetPos.y, this.defense_weapon.offsetPos.z)
            this.defense_model.rotation.set(this.defense_weapon.offsetRot.x, this.defense_weapon.offsetRot.y, this.defense_weapon.offsetRot.z)
            this.leftForeArm.add(this.defense_model)

            /*
            var gui = new GUI();
            gui.add(this.defense_model.rotation, 'x', -2*Math.PI, 2*Math.PI);
            gui.add(this.defense_model.rotation, 'y', -2*Math.PI, 2*Math.PI);
            gui.add(this.defense_model.rotation, 'z', -2*Math.PI, 2*Math.PI);

            gui.add(this.defense_model.position, 'x', -100, 100);
            gui.add(this.defense_model.position, 'y', -100, 100);
            gui.add(this.defense_model.position, 'z', -100, 100);
            */
        }
    }
}