import Modular from './Modular.js'
import * as THREE from '/build/three.module.js'

export default class FenceStraight extends Modular
{
    constructor(model, name)
    {
        super(model, name)

        this.preSetModel()
    }

    preSetModel(){
        // creates a copy of the original model
        this.model = this.resource.scene.clone()

        this.model.scale.set(2,2,2)

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(3.5, 3, 2)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 1.5, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()
    }
}