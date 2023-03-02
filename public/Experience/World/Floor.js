import Experience from '../Experience.js'
import * as THREE from '/node_modules/three/build/three.module.js'

import { WorkerTextureLoader } from '../Utils/Loader.js'

export default class Floor
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.gridSize = this.experience.gridSize

        // grid helper, needs to change based on world size
        //this.gridHelper = new THREE.GridHelper(50, 10, 0x000000, 0xffffff)
        //this.scene.add(this.gridHelper)

        // creates floor with initial size 1,1, so it scales perfectly
        this.floorGeo = new THREE.PlaneGeometry(1, 1);

        // setting texture
        const textureLoader = new WorkerTextureLoader();
        this.floorTexture = textureLoader.load( '/static/images/texture/floor.png', () => {
            // texture has loaded, now you can set its properties
            this.floorTexture.wrapS = THREE.RepeatWrapping;
            this.floorTexture.wrapT = THREE.RepeatWrapping;
            this.floorTexture.repeat.set(this.gridSize.x/2, this.gridSize.z/2);
        });
        const normalMap = textureLoader.load( '/static/images/texture/floor_normal.png' );
        const bumpMap = textureLoader.load( '/static/images/texture/floor_bump.png' );

        const material = new THREE.MeshStandardMaterial({
            map: this.floorTexture,
            normalMap: normalMap,
            bumpMap: bumpMap,
            bumpScale: 0.05
        });

        // setting mesh
        this.floorMesh = new THREE.Mesh(this.floorGeo, material);
        this.floorMesh.rotateX( - Math.PI / 2 );
        this.floorMesh.material.side = THREE.DoubleSide;
        this.floorMesh.scale.set(this.gridSize.x, this.gridSize.z)

        // add to scene
        this.scene.add(this.floorMesh);
    }

}