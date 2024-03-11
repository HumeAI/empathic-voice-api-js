precision mediump float;

uniform float uTime;
uniform vec2 resolution;
varying vec2 vUv;
varying vec3 vVelocity;
varying float vPhase;
uniform sampler2D uFFTTexture;

uniform vec3 uEmotionColorA;
uniform vec3 uEmotionColorB;
uniform vec3 uEmotionColorC;
uniform float uEmotionScoreA;
uniform float uEmotionScoreB;
uniform float uEmotionScoreC;

vec3 baseGradientColor(vec2 uv) {
    vec3 colorTop = vec3(0.2, 0.2, 0.2); // Dark tone
    vec3 colorBottom = vec3(0.8, 0.8, 0.8); // Light tone
    return mix(colorBottom, colorTop, uv.y);
}

void main() {
    vec2 uv = vUv;
    vec4 fftValue = texture2D(uFFTTexture, uv);
    float totalScore = uEmotionScoreA + uEmotionScoreB + uEmotionScoreC;

    if (totalScore <= 0.0) {
        // No audio logic
        float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
        float gradient = 1.0 - smoothstep(0.0, 0.5, dist);
        if (gradient < 0.81) {
            discard;
        }
        
        vec3 colorTop = vec3(0.6, 0.56, 0.53); // Dark tone
        vec3 colorBottom = vec3(0.9, 0.85, 0.81); // Light tone
        vec3 finalColor = mix(colorBottom, colorTop, uv.y + vPhase);
        
        gl_FragColor = vec4(finalColor, 0.55);
    } else {
        // Audio logic
        vec3 baseColor = baseGradientColor(uv);
        float normScoreA = uEmotionScoreA / totalScore;
        float normScoreB = uEmotionScoreB / totalScore;
        float normScoreC = uEmotionScoreC / totalScore;

        float distributionFactor = abs(sin(vPhase));
        vec3 gradientColor = vec3(0.0);
        if (distributionFactor < normScoreA) {
            gradientColor = uEmotionColorA;
        } else if (distributionFactor < normScoreA + normScoreB) {
            gradientColor = mix(uEmotionColorA, uEmotionColorB, (distributionFactor - normScoreA) / normScoreB);
        } else {
            gradientColor = mix(uEmotionColorB, uEmotionColorC, (distributionFactor - normScoreA - normScoreB) / normScoreC);
        }

        vec3 finalColor = mix(baseColor, gradientColor, 1.0);

        float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
        float gradient = 1.0 - smoothstep(0.0, 0.5, dist);
        if (gradient < 0.81) {
            discard;
        }

        gl_FragColor = vec4(finalColor, 1.0);
    }
}
