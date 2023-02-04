import * as THREE from '/node_modules/three/build/three.module.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import Monster from './Monster.js'

export default class Cthulhu extends Monster
{
    static asset_name = 'cthulhu'
    constructor(unique_name)
    {
        super()

        this.unique_name = unique_name
        this.life = 100
        this.maxLife = 100

        // Resource
        this.resource = this.resources.items[this.constructor.asset_name]

        this.preSetModel()

        // set animations in the right order
        // Bite_Front, Bite_InPlace, Dance, Death, HitRecieve, Idle, Jump, No, Walk, Yes
        this.setAnimation(this.resource.animations)

        this.strength = 10
    }

    preSetModel(){
        // creates a copy of the original model
        const originalModel = this.resource.scene
        this.model = SkeletonUtils.clone( originalModel )
        this.model.scale.set(2, 2, 2)

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(3, 6, 3)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 3, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()
    }
}