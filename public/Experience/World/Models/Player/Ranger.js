import * as THREE from '/node_modules/three/build/three.module.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import Player from './Player.js'

export default class Ranger extends Player
{
    static asset_name = 'ranger'
    constructor(unique_name)
    {
        super()

        this.unique_name = unique_name

        // Resource
        this.resource = this.resources.items[this.constructor.asset_name]

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

        //this.sword = this.resources.items.sword.scene
        //this.sword.scale.set(20, 20, 20)
        //this.sword.rotation.set(0, 0, - Math.PI / 4 )
        //rightHand.add(this.sword)

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(2, 6, 2)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 3, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()
    }
}