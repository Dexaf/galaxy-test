import type { Camera, Object3D, Vector2, Raycaster } from "three";

/**
 * @param camera 
 * @param pointerCoords normalized coords over the dom element of the render 
 * @param raycaster
 * @param hitObject
 * @return intersect one object
 * @summary do a ray cast based on normalized mouse coords over a render dom 
 */
export function cameraRaycastSingle(camera: Camera, pointerCoords: Vector2, raycaster: Raycaster, hitObject: Object3D) {
    raycaster.setFromCamera(pointerCoords, camera);

    return raycaster.intersectObject(hitObject, true);
}

/**
 * @param camera 
 * @param pointerCoords normalized coords over the dom element of the render 
 * @param raycaster
 * @param hitObjects
 * @return intersect multiple objects
 * @summary do a ray cast based on normalized mouse coords over a render dom 
 */
export function cameraRaycastMultiple(camera: Camera, pointerCoords: Vector2, raycaster: Raycaster, hitObjects: Object3D[]) {
    raycaster.setFromCamera(pointerCoords, camera);

    return raycaster.intersectObjects(hitObjects, true);
}