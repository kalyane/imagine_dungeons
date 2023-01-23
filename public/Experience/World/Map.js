import Experience from '../Experience.js'
import * as THREE from '/build/three.module.js'

export default class Map
{
    constructor()
    {
        this.experience = new Experience()
        this.gridSize = this.experience.gridSize
        this.world = this.experience.world
    }

    // constrain object to be inside the map
    checkBoundaries(object){
        // get bounding box with rith rotation
        let copy = object.clone()
        copy.updateMatrixWorld( true );
        var bb = new THREE.Box3().setFromObject(copy);
        
        // values to subtract position because the position is at the center of the box
        var subtractX = (bb.max.x - bb.min.x)/2
        var subtractZ = (bb.max.z - bb.min.z)/2

        // check if outside the grid, if yes, put at last possible position
        if(bb.min.x < this.gridSize['x']/-2) object.position.x = this.gridSize['x']/-2 + subtractX
        if(bb.max.x > this.gridSize['x']/2) object.position.x = this.gridSize['x']/2 - subtractX

        if(bb.min.z < this.gridSize['z']/-2) object.position.z = this.gridSize['z']/-2 + subtractZ
        if(bb.max.z > this.gridSize['z']/2) object.position.z = this.gridSize['z']/2 - subtractZ
    }

    // creates a matrix to represent the world map
    generateSolidMatrix(){
        // gets solid models
        this.solids = this.experience.world.solids

        // the matrix has double the size of the map to get to 0.5 increments
        this.matrix = []

        // loop through the rows in the matrix
        for (let i = 0; i < this.gridSize.x*2; i++) {
            // loop through the columns in the matrix
            this.matrix.push([])
            for (let j = 0; j < this.gridSize.z*2; j++) {
                // set the cell in the matrix to 1 (free)
                this.matrix[i][j] = 1;
            }
        }

        // loop through each solid model
        for (let solid of this.solids) {
            // get bounding box with rith rotation
            solid.modelDragBox.updateMatrixWorld( true );
            var bb = new THREE.Box3().setFromObject(solid.modelDragBox);
            
            var maxX = Math.round(this.roundToHalf(bb.max.x)+this.experience.world.gridSize.x/2)
            var minX = Math.round(this.roundToHalf(bb.min.x)+this.experience.world.gridSize.x/2)
            var maxZ = Math.round(this.roundToHalf(bb.max.z)+this.experience.world.gridSize.x/2)
            var minZ = Math.round(this.roundToHalf(bb.min.z)+this.experience.world.gridSize.x/2)
            // loop through the x-coordinates in the bounding box
            for (let x = minX*2; x <= maxX*2; x++) {
                // loop through the y-coordinates in the bounding box
                for (let z = minZ*2; z <= maxZ*2; z++) {
                    // set the cell in the matrix to 0
                    this.matrix[x][z] = 0;
                }
            }
        }
    }

    checkCollision(asset1, asset2) {
        // Get the bounding box of each square using Three.js
        const bb1 = asset1.modelDragBox.geometry.boundingBox
        const bb2 = asset2.modelDragBox.geometry.boundingBox
      
        // Check if the bounding boxes overlap in the x and y directions
        if (bb1.min.x < bb2.max.x && bb1.max.x > bb2.min.x &&
            bb1.min.y < bb2.max.y && bb1.max.y > bb2.min.y) {
          // There is a collision
          return true;
        } else {
          // There is no collision
          return false;
        }
    }

    calculateExactBoundingBox(box){
        // calculates bounding box relative to the world position
        var bounding = {...box.geometry.boundingBox}
        
        var maxX = box.position.x+bounding.max.x
        var minX = box.position.x+bounding.min.x
        var maxZ = box.position.z+bounding.max.z
        var minZ = box.position.z+bounding.min.z

        return {'max':{'x':maxX, 'z':maxZ}, 'min':{'x':minX, 'z':minZ}}
    }

    roundToHalf(num) {
        return Math.round(num * 2) / 2;
    }
}