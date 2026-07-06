import * as THREE from "three";
import { galaxyUniforms } from "./create-galaxy";
import { starsUniforms } from "./create-stars";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { starsConfig } from "./scene-gui-config";

interface SetupGUIParams {
    rebuildStars: () => void;
}

export function setupGUI({
    rebuildStars,
}: SetupGUIParams) {

    const gui = new GUI();

    //-----------------------------
    // STARS UNIFORMS
    //-----------------------------

    const uniformsFolder = gui.addFolder("Stars Uniforms");

    uniformsFolder
        .add(starsConfig, "shineTimeRatio", 0, 30, 0.01)
        .name("Shine Time ratio")
        .onChange((v: number) => {
            starsUniforms.u_shineTimeRatio.value = v;
        });

    uniformsFolder
        .add(starsConfig, "shinePerc", 0, 1, 0.01)
        .name("Shine %")
        .onChange((v: number) => {
            starsUniforms.u_shinePerc.value = v;
        });

    uniformsFolder
        .add(starsConfig, "pushStrength", 0, 10, 0.01)
        .name("pointer push strength")
        .onChange((v: number) => {
            starsUniforms.u_pushStrength.value = v;
        });

    uniformsFolder
        .add(starsConfig, "hitInfluenceRadius", 0, 10, 0.01)
        .name("radius influence for pointer")
        .onChange((v: number) => {
            starsUniforms.u_hitInfluenceRadius.value = v;
        });

    uniformsFolder
        .addColor(starsConfig, "color")
        .name("Color")
        .onChange((v: string) => {
            starsUniforms.u_color.value.set(v);
        });

    //-----------------------------
    // STAR GENERATION
    //-----------------------------

    const generationFolder = gui.addFolder("Stars Generation");

    generationFolder
        .add(starsConfig, "starsNumber", 10, 5000, 1)
        .onFinishChange(rebuildStars);

    generationFolder
        .add(starsConfig, "starSize", 1, 500, 1)
        .onFinishChange(rebuildStars);

    generationFolder
        .add(starsConfig, "starSizeRange", 0, 200, 1)
        .onFinishChange(rebuildStars);

    generationFolder
        .add(starsConfig, "bigStarSizeRange", 0, 500, 1)
        .onFinishChange(rebuildStars);

    generationFolder
        .add(starsConfig, "bigStarPerc", 0, 1, 0.01)
        .onFinishChange(rebuildStars);

    generationFolder
        .add(starsConfig, "maxStarDistanceHor", 0.1, 20, 0.1)
        .onFinishChange(rebuildStars);

    generationFolder
        .add(starsConfig, "maxStarDistanceY", 0.1, 20, 0.1)
        .onFinishChange(rebuildStars);

    generationFolder
        .add(starsConfig, "minDistFromCenter", 0, 2, 0.01)
        .onFinishChange(rebuildStars);


    const galaxyFolder = gui.addFolder("Galaxy uniforms");

    galaxyFolder
        .add(galaxyUniforms.u_hitInfluenceRadius, "value", 0, 10, 0.1)
        .name("radius influence for pointer")

    //-----------------------------
    // TEXTURES
    //-----------------------------

    const texturesFolder = gui.addFolder("Textures");

    const textureLoader = new THREE.TextureLoader();

    const textureActions = {

        loadStarMask() {

            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";

            input.onchange = () => {

                const file = input.files?.[0];

                if (!file)
                    return;

                const url = URL.createObjectURL(file);

                textureLoader.load(url, texture => {

                    texture.generateMipmaps = false;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;

                    starsUniforms.u_mask.value = texture;
                });

            };

            input.click();

        },

        loadNoiseTexture() {

            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";

            input.onchange = () => {

                const file = input.files?.[0];

                if (!file)
                    return;

                const url = URL.createObjectURL(file);

                textureLoader.load(url, texture => {

                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;

                    galaxyUniforms.u_noiseTxt.value = texture;

                });

            };

            input.click();

        }

    };

    texturesFolder
        .add(textureActions, "loadStarMask")
        .name("Load Star Mask");

    texturesFolder
        .add(textureActions, "loadNoiseTexture")
        .name("Load Noise");

    galaxyFolder.open();
    uniformsFolder.open();
    generationFolder.open();
    texturesFolder.open();

    return gui;
}