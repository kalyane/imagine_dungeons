import * as THREE from '/build/three.module.js'
import * as SkeletonUtils from '/jsm/utils/SkeletonUtils.js'
import Character from './Character.js'
import KeyboardInput from '../Utils/KeyboardInput.js'

export default class Warrior extends Character
{
    constructor(name)
    {
        super('warriorModel', name)
        this.setControl(new KeyboardInput())

        this.preSetModel()

        // set animations in the right order
        this.setAnimation(
            this.resource.animations[1], // idle
            this.resource.animations[6], // walk
            this.resource.animations[4], // attack
            this.resource.animations[0] // death
        )

        this.control.on('newState', () =>
        {
            if (this.experience.world.playing && this.life>0){
                this.updateState()
            }
        })

        this.attackPower = 50
    }

    preSetModel(){
        // creates a copy of the original model
        const originalModel = this.resource.scene
        this.model = SkeletonUtils.clone( originalModel )
        this.model.scale.set(2, 2, 2)

        // add sword to player
        const rightHand = this.model.getObjectByName("mixamorigRightHand")

        this.sword = this.resources.items.swordModel.scene
        this.sword.scale.set(20, 20, 20)
        this.sword.rotation.set(0, 0, - Math.PI / 4 )
        rightHand.add(this.sword)

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(2, 4, 2)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 2, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()
    }

    // checkCollisions()
    // {
    //     //this.box.update()
        
    //     //this.warriorBox.copy(this.box.geometry.boundingBox).applyMatrix4(this.model.matrixWorld)

    //     //console.log("warrior", this.warriorBox)
    //     //console.log("zombie", this.experience.world.zombie.zombieBox)

        
    //     //mesh.userData.obb.copy(mesh.geometry.userData.obbw)
    //     //mesh.userData.obb.applyMatrix4(mesh.matrixWorld)

    //     let modelBox = new THREE.Box3();
    //     modelBox.copy(this.modelDragBox.geometry.boundingBox);
    //     modelBox.applyMatrix4(this.modelDragBox.matrixWorld);

    //     for (var key in this.experience.world.dictModels){
    //         var otherModel = this.experience.world.dictModels[key]
    //         let otherBox = new THREE.Box3();
    //         otherBox.copy(otherModel.modelDragBox.geometry.boundingBox);
    //         otherBox.applyMatrix4(otherModel.modelDragBox.matrixWorld);
    //         if (otherModel.name != this.name && modelBox.intersectsBox(otherBox)){
    //             return true
    //         }
    //     }
    //     return false
    // }
}