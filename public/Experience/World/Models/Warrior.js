import * as THREE from '/build/three.module.js'
import * as SkeletonUtils from '/jsm/utils/SkeletonUtils.js'
import Character from '../Player.js'
import KeyboardInput from '../../Utils/KeyboardInput.js'
import * as CANNON from 'cannon-es'

export default class Cleric extends Character
{
    constructor(model, name)
    {
        super(model, name)

        this.preSetModel()

        // set animations in the right order
        // attack, death, idle, impact, run backward, run forward, t-pose, walk backward, walk forward
        this.setAnimation(this.resource.animations)

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

        this.boxBody = new CANNON.Body({ 
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(1, 2, 1))
        });

        this.setModel()
    }
}