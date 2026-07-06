attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform sampler2D u_noiseTxt;
uniform float u_time; 
uniform vec3 u_hitPos;
uniform float u_posPerc;
uniform float u_hitInfluenceRadius;

varying vec2 v_uv;
varying float v_height;
varying float v_noise;
varying float v_pointerAlteration;

const vec2 CENTER = vec2(0.5, 0.5);
const vec2 CIRCLE_START = vec2(1., 0.);

const vec2 ELLIPSE = vec2(1., 0.65);

const float BRANCHES = 5.;
const float ANGL_BETWNEEN_BRANCHES = 360./BRANCHES;
const float TIME_RATIO = -1.;


vec2 rotate(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);

    mat2 m = mat2(
        c, -s,
        s,  c
    );

    return m * p;
}

float angleBetween(vec2 a, vec2 b) {
    float dotAB = dot(a, b);
    float crossAB = a.x * b.y - a.y * b.x;
    float angle = atan(crossAB, dotAB);
    float mask = step(angle, 0.0);

    return mix(angle, angle + 6.28318530718, mask);
}

void main() {
    vec3 pos = position * u_posPerc;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        
    vec3 worldPos = modelPosition.xyz;
    //distance from point
    float distanceFromPointer = distance(worldPos, u_hitPos);
    // intensity of push from 0 to 1
    v_pointerAlteration = clamp((u_hitInfluenceRadius - distanceFromPointer) / u_hitInfluenceRadius, 0.0, 1.0);

    //center the uv
    vec2 l_uv = uv - 0.5;
    //rotate it
    l_uv = rotate(l_uv, u_time * TIME_RATIO * 0.1);
    //place it back and some math magic
    l_uv = fract(l_uv + 0.5);

    float noise = 1. - texture2D(u_noiseTxt, l_uv).r;
    v_noise = noise;

    //turn the uv from circle to ellipsis
    vec2 e_uv = uv - CENTER;
    e_uv = vec2(e_uv.x / ELLIPSE.x, e_uv.y/ELLIPSE.y);

    float d = length(e_uv) / 0.5;
    float smoothD = smoothstep(0.0, 1.1, d);

    vec2 rotatedUv = rotate(e_uv, smoothD * radians(120.0) + u_time * TIME_RATIO);

    float currAngle = angleBetween(CIRCLE_START, rotatedUv);
    currAngle = degrees(currAngle);

    float dWithABB = ANGL_BETWNEEN_BRANCHES - mod(currAngle, ANGL_BETWNEEN_BRANCHES);
    dWithABB /= ANGL_BETWNEEN_BRANCHES;
    float waveMask = sin(dWithABB * 3.14159265);
    waveMask = waveMask * waveMask;

    float gasMask = noise * ( 1. - smoothD) * 3.;
    float globalGasMask = (1. - smoothD) * noise;

    float centerMask = pow(smoothstep(0.05, 0.0, smoothD), 0.7);

    float finalMask = waveMask * gasMask + centerMask + globalGasMask;
    finalMask = clamp(finalMask, 0., 1.0);

    float thickness = 0.3;
    float cThickness = 0.15;

    pos.z += finalMask * thickness + centerMask * cThickness + mix(0., 1., v_pointerAlteration) * noise;

    v_height = finalMask;

    modelPosition = modelMatrix * vec4(pos, 1.0);
        
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    v_uv = uv;
}