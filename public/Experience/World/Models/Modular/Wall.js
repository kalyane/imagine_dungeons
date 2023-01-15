import Modular from './Modular.js'
import * as THREE from '/build/three.module.js'

export default class Wall extends Modular
{
    constructor(model, name)
    {
        super(model, name)

        this.preSetModel()
    }

    preSetModel(){
        // creates a copy of the original model
        this.model = this.resource.scene.clone()

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(6, 6, 1)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 3, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()
    }
}