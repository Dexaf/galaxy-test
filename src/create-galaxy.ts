import { Mesh, PlaneGeometry, RawShaderMaterial, RepeatWrapping, TextureLoader, Uniform } from "three";
import vertexShader from './vertex.glsl?raw';
import fragmentShader from './fragment.glsl?raw';
import { galaxyConfig } from "./scene-gui-config";

export const galaxyUniforms = {
    u_time: new Uniform(0),
    u_noiseTxt: new Uniform(null),
};

export function createGalaxy() {
    const textureLoader = new TextureLoader();
    const txt = textureLoader.load(galaxyConfig.noiseTexture)
    txt.wrapS = RepeatWrapping;
    txt.wrapT = RepeatWrapping;

    galaxyUniforms.u_noiseTxt.value = txt;

    const RESOLUTION_RATE = 10;
    const resolution = Math.pow(2, RESOLUTION_RATE);
    const geometry = new PlaneGeometry(10, 10, resolution, resolution);
    const material = new RawShaderMaterial({
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: galaxyUniforms,
        depthTest: false,
        depthWrite: false,
        transparent: true,
    });
    return new Mesh(geometry, material);
}