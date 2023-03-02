import * as THREE from '/node_modules/three/build/three.module.js';

class WorkerTextureLoader extends THREE.TextureLoader {
  load(url, onLoad, onProgress, onError) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const texture = new THREE.Texture();
          texture.image = image;
          texture.needsUpdate = true;
          if (onLoad) onLoad(texture);
        };
        image.onerror = onError;
        image.src = objectUrl;
      })
      .catch(error => {
        if (onError) onError(error);
      });
  }
}

// Export the WorkerTextureLoader class
export { WorkerTextureLoader };
