precision mediump float;

uniform sampler2D textures[15]; // Array of 15 textures for feedback trails
uniform float blendFactors[15]; // Blend factors for each texture
uniform float textureInfluence[15]; // New uniform for texture influence
uniform vec2 resolution; // Resolution of the render targets
uniform vec4 blendColor; // New uniform for base blend color
uniform float blendSharpness; // New uniform for blend sharpness
// Function to create a gradient color
vec4 createGradient(float t) {
    vec4 colorA = vec4(0.0, 0.7, 1.0, 1.0); // Cyan
    vec4 colorB = vec4(0.5, 0.0, 0.5, 1.0); // Purple
    vec4 colorC = vec4(1.0, 0.0, 0.0, 1.0); // Red
    vec4 colorD = vec4(1.0, 0.70, 0.0, 1.0); // Yellow
    vec4 colorE = vec4(0.0, 1.0, 0.0, 1.0); // Green
    vec4 colorF = vec4(0.0, 0.0, 1.0, 1.0); // Blue

    float phase1 = smoothstep(0.0, 0.2, t);
    float phase2 = smoothstep(0.2, 0.4, t);
    float phase3 = smoothstep(0.4, 0.6, t);
    float phase4 = smoothstep(0.6, 0.8, t);
    float phase5 = smoothstep(0.8, 1.0, t);

    vec4 gradient = mix(colorA, colorB, phase1); // Transition from A to B
    gradient = mix(gradient, colorC, phase2); // Transition from current gradient to C
    gradient = mix(gradient, colorD, phase3); // Transition from current gradient to D
    gradient = mix(gradient, colorE, phase4); // Transition from current gradient to E
    gradient = mix(gradient, colorF, phase5); // Transition from current gradient to F

    return gradient;
}

// Blend Mode: Multiply
vec4 blendMultiply(vec4 baseColor, vec4 blendColor) {
    return baseColor * blendColor;
}

// Blend Mode: Screen
vec4 blendScreen(vec4 baseColor, vec4 blendColor) {
    return vec4(1.0) - ((vec4(1.0) - baseColor) * (vec4(1.0) - blendColor));
}

// Blend Mode: Overlay (combination of multiply and screen)
vec4 blendOverlay(vec4 baseColor, vec4 blendColor) {
    vec4 result;
    for (int i = 0; i < 3; i++) {
        result[i] = baseColor[i] < 0.5 ? (2.0 * baseColor[i] * blendColor[i]) : (1.0 - 2.0 * (1.0 - baseColor[i]) * (1.0 - blendColor[i]));
    }
    result.a = baseColor.a; // Preserve alpha of the base color
    return result;
}

vec3 adjustBrightness(vec3 color, float brightness) {
    return color + brightness;
}

vec3 adjustContrast(vec3 color, float contrast) {
    return (color - 0.5) * contrast + 0.5;
}

vec3 adjustSaturation(vec3 color, float saturation) {
    float grey = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(grey), color, saturation);
}

vec3 adjustGamma(vec3 color, float gamma) {
    return pow(color, vec3(1.0 / gamma));
}



void main() {

    float u_brightness = 0.0; //Typically, a range of -1.0 to 1.0
    float u_contrast = 1.0; //A typical range might be from 0.5 to 2.0.
    float u_saturation = 1.0; //Range: A value of 0.0 results in a grayscale image, while values greater than 1.0 increase the saturation, making the colors more intense. 
    float u_gamma = 1.20; //The typical range is from 0.8 to 2.2


    // float u_brightness = 0.0; //Typically, a range of -1.0 to 1.0
    // float u_contrast = 1.0; //A typical range might be from 0.5 to 2.0.
    // float u_saturation = 1.0; //Range: A value of 0.0 results in a grayscale image, while values greater than 1.0 increase the saturation, making the colors more intense. 
    // float u_gamma = 1.20; //The typical range is from 0.8 to 2.2


    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0); // Start with a transparent color
    float totalAlpha = 0.0;

        // Manually handle each texture to accumulate color and alpha
    // Texture 0
    vec4 texColor0 = texture2D(textures[0], uv);
    float grayValue0 = (texColor0.r + texColor0.g + texColor0.b) / 3.0;
    //vec4 gradientColor0 = createGradient(grayValue0);
    float influence0 = pow(blendFactors[0], blendSharpness) * textureInfluence[0];
    color += texColor0 * influence0;
    totalAlpha += texColor0.a * influence0;

    // Texture 1
    vec4 texColor1 = texture2D(textures[1], uv);
    float grayValue1 = (texColor1.r + texColor1.g + texColor1.b) / 3.0;
    //vec4 gradientColor1 = createGradient(grayValue1);
    float influence1 = pow(blendFactors[1], blendSharpness) * textureInfluence[1];
    color += texColor1 * influence1;
    totalAlpha += texColor1.a * influence1;

        // Texture 2
    vec4 texColor2 = texture2D(textures[2], uv);
    float grayValue2 = (texColor2.r + texColor2.g + texColor2.b) / 3.0;
    //vec4 gradientColor2 = createGradient(grayValue1);
    float influence2 = pow(blendFactors[2], blendSharpness) * textureInfluence[2];
    color += texColor2 * influence2;
    totalAlpha += texColor2.a * influence2;

    // Texture 3
    vec4 texColor3 = texture2D(textures[3], uv);
    float grayValue3 = (texColor3.r + texColor3.g + texColor3.b) / 3.0;
    //vec4 gradientColor3 = createGradient(grayValue3);
    float influence3 = pow(blendFactors[3], blendSharpness) * textureInfluence[3];
    color += texColor3  * influence3;
    totalAlpha += texColor3.a * influence3;

    // Texture 4
    vec4 texColor4 = texture2D(textures[4], uv);
    float grayValue4 = (texColor4.r + texColor4.g + texColor4.b) / 3.0;
    //vec4 gradientColor4 = createGradient(grayValue4);
    float influence4 = pow(blendFactors[4], blendSharpness) * textureInfluence[4];
    color += texColor4  * influence4;
    totalAlpha += texColor4.a * influence4;

//     // Texture 5
//     vec4 texColor5 = texture2D(textures[5], uv);
//     float grayValue5 = (texColor5.r + texColor5.g + texColor5.b) / 3.0;
//     //vec4 gradientColor5 = createGradient(grayValue5);
//     float influence5 = pow(blendFactors[5], blendSharpness) * textureInfluence[5];
//     color += texColor5  * influence5;
//     totalAlpha += texColor5.a * influence5;

//     // Texture 6
//     vec4 texColor6 = texture2D(textures[6], uv);
//     float grayValue6 = (texColor6.r + texColor6.g + texColor6.b) / 3.0;
//     //vec4 gradientColor6 = createGradient(grayValue6);
//     float influence6 = pow(blendFactors[6], blendSharpness) * textureInfluence[6];
//     color += texColor6  * influence6;
//     totalAlpha += texColor6.a * influence6;

//     // Texture 7
//     vec4 texColor7 = texture2D(textures[7], uv);
//     float grayValue7 = (texColor7.r + texColor7.g + texColor7.b) / 3.0;
//     //vec4 gradientColor7 = createGradient(grayValue7);
//     float influence7 = pow(blendFactors[7], blendSharpness) * textureInfluence[7];
//     color += texColor7  * influence7;
//     totalAlpha += texColor7.a * influence7;

//     // Texture 8
//     vec4 texColor8 = texture2D(textures[8], uv);
//     float grayValue8 = (texColor8.r + texColor8.g + texColor8.b) / 3.0;
//     //vec4 gradientColor8 = createGradient(grayValue8);
//     float influence8 = pow(blendFactors[8], blendSharpness) * textureInfluence[8];
//     color += texColor8 * influence8;
//     totalAlpha += texColor8.a * influence8;

//     // Texture 9
//     vec4 texColor9 = texture2D(textures[9], uv);
//     float grayValue9 = (texColor9.r + texColor9.g + texColor9.b) / 3.0;
//     //vec4 gradientColor9 = createGradient(grayValue9);
//     float influence9 = pow(blendFactors[9], blendSharpness) * textureInfluence[9];
//     color += texColor9  * influence9;
//     totalAlpha += texColor9.a * influence9;

//     // Texture 10
//     vec4 texColor10 = texture2D(textures[10], uv);
//     float grayValue10 = (texColor10.r + texColor10.g + texColor10.b) / 3.0;
//    // vec4 gradientColor10 = createGradient(grayValue10);
//     float influence10 = pow(blendFactors[10], blendSharpness) * textureInfluence[10];
//     color += texColor10  * influence10;
//     totalAlpha += texColor10.a * influence10;

//     // Texture 11
//     vec4 texColor11 = texture2D(textures[11], uv);
//     float grayValue11 = (texColor11.r + texColor11.g + texColor11.b) / 3.0;
//     //vec4 gradientColor11 = createGradient(grayValue11);
//     float influence11 = pow(blendFactors[11], blendSharpness) * textureInfluence[11];
//     color += texColor11  * influence11;
//     totalAlpha += texColor11.a * influence11;

//     // Texture 12
//     vec4 texColor12 = texture2D(textures[12], uv);
//     float grayValue12 = (texColor12.r + texColor12.g + texColor12.b) / 3.0;
//     //vec4 gradientColor12 = createGradient(grayValue12);
//     float influence12 = pow(blendFactors[12], blendSharpness) * textureInfluence[12];
//     color += texColor12 *  influence12;
//     totalAlpha += texColor12.a * influence12;

//     // Texture 13
//     vec4 texColor13 = texture2D(textures[13], uv);
//     float grayValue13 = (texColor13.r + texColor13.g + texColor13.b) / 3.0;
//     //vec4 gradientColor13 = createGradient(grayValue13);
//     float influence13 = pow(blendFactors[13], blendSharpness) * textureInfluence[13];
//     color += texColor13 *  influence13;
//     totalAlpha += texColor13.a * influence13;


//     // Texture 14
//     vec4 texColor14 = texture2D(textures[14], uv);
//     float grayValue14 = (texColor14.r + texColor14.g + texColor14.b) / 3.0;
//     //vec4 gradientColor14 = createGradient(grayValue14);
//     float influence14 = pow(blendFactors[14], blendSharpness) * textureInfluence[14];
//     color += texColor14 * influence14;
//     totalAlpha += texColor14.a * influence14;


    // Repeat the above pattern for textures 2 through 14

    // Ensure color is normalized based on total alpha to prevent saturation
    if (totalAlpha > 0.0) {
        color /= totalAlpha;
    }

    // Set the calculated alpha to the color, ensuring it does not exceed 1.0
    color.a = min(totalAlpha, 1.0);

    // Adjust brightness, contrast, saturation, and gamma on the RGB components
    color.rgb = adjustBrightness(color.rgb, u_brightness);
    color.rgb = adjustContrast(color.rgb, u_contrast);
    color.rgb = adjustSaturation(color.rgb, u_saturation);
    color.rgb = adjustGamma(color.rgb, u_gamma);

    // Output the final color
    gl_FragColor = color;
}
