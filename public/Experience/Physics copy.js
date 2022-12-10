import Experience from './Experience.js';
import * as THREE from '/build/three.module.js'
import * as CANNON from 'cannon-es'

export default class Physics
{
    constructor()
    {
        // Setup our world
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0)
        });

        this.timeStep = 1/60;
        this.world.quatNormalizeSkip = 0;
        this.world.quatNormalizeFast = false;

        this.solver = new CANNON.GSSolver();

        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4;

        this.solver.iterations = 7;
        this.solver.tolerance = 0.1;
        var split = true;
        /* if(split)
            this.world.solver = new CANNON.SplitSolver(this.solver);
        else
            this.world.solver = this.solver; */

        this.world.broadphase = new CANNON.NaiveBroadphase();

        this.experience = new Experience()
        this.assets = this.experience.world.assets
        this.ready = false

        // Create a slippery material
        this.slipperyMaterial = new CANNON.Material({
            friction: 0.1
        });

        


        // test
        /* const boxGeo = new THREE.BoxGeometry(10, 10, 10);
        const boxMat = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        });
        this.boxMesh = new THREE.Mesh(boxGeo, boxMat);
        this.experience.scene.add(this.boxMesh);

        this.boxBody = new CANNON.Body({
            type: CANNON.Body.STATIC, 
            shape: new CANNON.Box(new CANNON.Vec3(5, 5, 5)),
            position: new CANNON.Vec3(10, 0, 0)
        });

        this.world.addBody(this.boxBody); */
        
    }

    createGround(){
        // Create a static body for the ground
        var planeBody = new CANNON.Body({
            mass: 0,                             // Mass of 0 makes it static
            shape: new CANNON.Plane(),                   // Shape of the body
            quaternion: new CANNON.Quaternion()  // Orientation (no rotation)
        });
        this.world.addBody(planeBody);
        this.boxBody = new CANNON.Body({
            mass: 1,                             // Mass of the body
            shape: new CANNON.Box(new CANNON.Vec3(1, 2, 1)), // Shape of the body
            material: this.experience.physics.slipperyMaterial            // Slippery material
        });
        this.world.addBody(this.boxBody);
    }

    addBodies(){
        for(var i=0; i<this.assets.length; i++){
            this.world.addBody(this.assets[i].boxBody);
        }
    }

    /* update(){
        if (this.ready){
            //console.log(this.assetBodies)
            this.world.step(this.timeStep)
            // Update all assets positions
            for(var i=0; i<this.assets.length; i++){
                this.assets[i].modelDragBox.position.copy(this.assets[i].boxBody.position);
                this.assets[i].modelDragBox.position.copy(this.assets[i].boxBody.position);
            }

            this.boxMesh.position.copy(this.boxBody.position);
            this.boxMesh.quaternion.copy(this.boxBody.quaternion); 
        }
    } */

    animate() {
        // Create a loop to advance the simulation
        setInterval(() => {
            // Step the simulation forward in time
            this.world.step(this.timeStep)

            // Apply impulses or forces to the objects in the simulation

            // Limit the magnitude of the velocity of the objects

            // Update the positions and orientations of the objects in the simulation
            // Update all assets positions
            for(var i=0; i<this.assets.length; i++){
                this.assets[i].modelDragBox.position.copy(this.assets[i].boxBody.position);
                this.assets[i].modelDragBox.position.copy(this.assets[i].boxBody.position);
            }
            this.experience.world.player.modelDragBox.position.copy(this.boxBody.position);
        }, this.timeStep);
    }
}