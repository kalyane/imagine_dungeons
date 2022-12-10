import Experience from './Experience.js';
import * as THREE from '/build/three.module.js'
import * as CANNON from 'cannon-es'

export default class Physics
{
    constructor()
    {
        // Create a world
        this.world = new CANNON.World();

        // Set gravity to simulate a downwards force
        this.world.gravity.set(0, -9.82, 0);

        // Create a slippery material
        var slipperyMaterial = new CANNON.Material({
            friction: 1
        });

        // Create a box shape
        var boxShape = new CANNON.Box(new CANNON.Vec3(1, 2, 1));

        // Create a body for the box
        this.boxBody = new CANNON.Body({
            mass: 1, // Set the mass of the box
            shape: boxShape,
            position: new CANNON.Vec3(10, 10, 0), // Set the initial position so that the box is on the ground
            material: slipperyMaterial
        });

        // Create a plane shape to represent the ground
        var planeShape = new CANNON.Plane();

        // Create a static body for the ground
        this.planeBody = new CANNON.Body({
            mass: 0,                             // Mass of 0 makes it static
            shape: planeShape,                   // Shape of the body
            position: new CANNON.Vec3(0, 0, 0),  // Initial position
            quaternion: new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2) // Orientation (no rotation)
        });

        // Add the bodies to the world
        this.world.addBody(this.planeBody);
        this.world.addBody(this.boxBody);
        

        // Create a material for the box
        var boxMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000
        });

        // Create a geometry for the box
        var boxGeometry = new THREE.BoxGeometry(1, 2, 1);

        // Create a mesh for the box
        this.boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

        var geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
        var mat = new THREE.MeshBasicMaterial({ color: "blue", side: THREE.DoubleSide });
        this.planeMesh = new THREE.Mesh(geo, mat);

        // Create a scene
        this.experience = new Experience()
        this.scene = this.experience.scene

        // Add the box mesh to the scene
        this.scene.add(this.boxMesh);
        this.scene.add(this.planeMesh);
        // Step the simulation forward in time
       this.animate()

        
    }

    animate() {
        // Step the simulation forward in time
        this.world.step(1/60);
      
        // Update the positions and orientations of the objects in the simulation
        this.boxMesh.position.copy(this.boxBody.position);
        this.boxMesh.quaternion.copy(this.boxBody.quaternion);
        this.planeMesh.position.copy(this.planeBody.position);
        this.planeMesh.quaternion.copy(this.planeBody.quaternion);
      
        // Repeat the animation
        requestAnimationFrame(this.animate);
      }


}