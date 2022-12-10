import * as THREE from '/build/three.module.js'
import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'
import { GUI } from 'dat.gui'

/**
 * class used to get keyboard input and translate into the game keys
 */
export default class PlayerControl extends EventEmitter
{
    constructor(model)
    {
        super()

        this.experience = new Experience()

        // state
        this.toggleRun = true;

        // keys
        this.directions = ['w', 'a', 's', 'd']

        // temporary data
        this.walkDirection = new THREE.Vector3();
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.rotateQuarternion = new THREE.Quaternion();
        this.cameraTarget = new THREE.Vector3();
        this.idealOffset = new THREE.Vector3(-3, 8, -12)

        // constants
        this.fadeDuration = 0.2;
        this.runVelocity = 20;
        this.walkVelocity = 5;

        // use model to change animation
        this.model = model;
        // use modelDragBox to change position
        this.modelDragBox = this.model.modelDragBox;
        this.boxBody = this.model.boxBody;

        this.camera = this.experience.camera.instance;
        this.camera.position.x = this.modelDragBox.position.x
        this.camera.position.y = this.modelDragBox.position.y + 20
        this.camera.position.z = this.modelDragBox.position.z + 20

        this.updateCameraTarget(0, 0);

        // check if key was pressed or released
        this.keysPressed = {};
        document.addEventListener('keydown', (event) => {
            if (event.shiftKey) {
                this.switchRunToggle();
            }
            else {
              this.keysPressed[event.key.toLowerCase()] = true;
            }
        }, false);

        document.addEventListener('keyup', (event) => {
          this.keysPressed[event.key.toLowerCase()] = false;
        }, false);

    }

    switchRunToggle(){
      this.toggleRun = !this.toggleRun;
    }

    update(delta) {
      var directionPressed = this.directions.some( (key) => {return this.keysPressed[key] == true;});
      
      var play;
      if (directionPressed && this.toggleRun) {
          play = this.model.animation.actions.run_forward;
      }
      else if (directionPressed) {
          play = this.model.animation.actions.walk_forward;
      }
      else {
          play = this.model.animation.actions.idle;
      }

      if (this.model.animation.actions.current != play) {
          this.model.animation.actions.current.fadeOut(this.fadeDuration);
          play.reset().fadeIn(this.fadeDuration).play();
          this.model.animation.actions.current = play;
      }

      this.model.animation.mixer.update(delta);
      if (this.model.animation.actions.current == this.model.animation.actions.run_forward || this.model.animation.actions.current == this.model.animation.actions.walk_forward) {
          // calculate towards camera direction
          var angleYCameraDirection = Math.atan2((this.camera.position.x - this.modelDragBox.position.x), (this.camera.position.z - this.modelDragBox.position.z));
          // diagonal movement angle offset
          var directionOffset = this.directionOffset(this.keysPressed);
          // rotate model
          this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
          this.modelDragBox.quaternion.rotateTowards(this.rotateQuarternion, 0.2);
          // calculate direction
          this.camera.getWorldDirection(this.walkDirection);
          this.walkDirection.y = 0;
          this.walkDirection.normalize();
          this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
          // run/walk velocity
          var velocity = this.model.animation.actions.current == this.model.animation.actions.run_forward ? this.runVelocity : this.walkVelocity;
          // move model & camera
          var moveX = this.walkDirection.x * velocity * delta;
          var moveZ = this.walkDirection.z * velocity * delta;
          let copyBox = this.modelDragBox.clone()
          this.modelDragBox.position.x += moveX;
          this.modelDragBox.position.z += moveZ;

          // world boundaries
          this.experience.world.checkBoundaries(this.modelDragBox)
          let diffX = this.modelDragBox.position.x - copyBox.position.x
          let diffZ = this.modelDragBox.position.z - copyBox.position.z
          this.boxBody.position.x += diffX
          this.boxBody.position.z += diffZ
          this.boxBody.quaternion.copy(this.modelDragBox.quaternion)
          this.updateCameraTarget(diffX, diffZ);

      }
      
    }

    changePosition(){
        console.log(this.boxBody.velocity)
        if (this.keysPressed['w']) {
            this.boxBody.applyImpulse(new Vec3(0, 0, -1), new Vec3(0, 0, 0));
        }
        if (this.keysPressed['s']) {
            this.boxBody.applyImpulse(new Vec3(0, 0, 1), new Vec3(0, 0, 0));
        }
        if (this.keysPressed['d']) {
            this.boxBody.applyImpulse(new Vec3(-1, 0, 0), new Vec3(0, 0, 0));
        }
        if (this.keysPressed['a']) {
            this.boxBody.applyImpulse(new Vec3(-1, 0, 0), new Vec3(0, 0, 0));
        }
        
    }

    updateCameraTarget(moveX, moveZ) {
        // move camera
        this.camera.position.x += moveX;
        this.camera.position.z += moveZ;
        
        // update camera target
        this.cameraTarget.x = this.modelDragBox.position.x;
        this.cameraTarget.y = this.modelDragBox.position.y + 3;
        this.cameraTarget.z = this.modelDragBox.position.z;
        this.camera.lookAt(this.cameraTarget);
    }

    directionOffset(keysPressed) {
      var directionOffset = 0; // w
      if (keysPressed['w']) {
          if (keysPressed['a']) {
              directionOffset = Math.PI / 4; // w+a
          }
          else if (keysPressed['d']) {
              directionOffset = -Math.PI / 4; // w+d
          }
      }
      else if (keysPressed['s']) {
          if (keysPressed['a']) {
              directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
          }
          else if (keysPressed['d']) {
              directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
          }
          else {
              directionOffset = Math.PI; // s
          }
      }
      else if (keysPressed['a']) {
          directionOffset = Math.PI / 2; // a
      }
      else if (keysPressed['d']) {
          directionOffset = -Math.PI / 2; // d
      }
      return directionOffset;
  }
}