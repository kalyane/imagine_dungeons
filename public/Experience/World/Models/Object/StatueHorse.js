import Modular from './Object.js'
import * as THREE from '/node_modules/three/build/three.module.js'

export default class StatueHorse extends Modular
{
    static asset_name = 'statue_horse'
    constructor(unique_name)
    {
        super()

        this.unique_name = unique_name

        // Resource
        this.resource = this.resources.items[this.constructor.asset_name]

        this.preSetModel()
    }

    preSetModel(){
        // creates a copy of the original model
        this.model = this.resource.scene.clone()

        this.model.scale.set(2,2,2)

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(3, 10, 3)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation(0, 5, 0) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()
    }
}