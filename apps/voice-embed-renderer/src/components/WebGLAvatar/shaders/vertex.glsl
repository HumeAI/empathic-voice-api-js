// vertex.glsl

precision mediump float;
#define NUM_KEY_PARTICLES 4 
#define TRIANGLE_WAVE_SEGMENTS 50
uniform float uTime;
uniform float deltaTime;
uniform float motionBlendFactor; 
uniform int motionType;
attribute vec3 initialPosition;
attribute vec3 velocity;
attribute float phase;
varying vec3 vColor;
varying vec3 vVelocity;
varying float vPhase;
const float pi = 3.1415926535897932384626433832795;
uniform int targetMotionType;  
uniform vec3 keyParticlePositions[NUM_KEY_PARTICLES]; 
uniform float keyParticleInfluenceRadius[NUM_KEY_PARTICLES]; 
uniform float repulsionStrength;
uniform float attractionStrength;
uniform float uCurrentTime;
uniform float maxLifetime;
attribute float lifetime;
attribute float birthTime;
varying vec2 vUv;
uniform float uParticleSize;
uniform vec3 uBlurDirection;
uniform vec2 uPrevMouse;
uniform vec2 resolution;
uniform float maxMouseDistance;
uniform float mouseDistanceFactor;
uniform float uAudioData;
uniform float basePointSize;
uniform float variations;
uniform float curvature;
uniform float width;
uniform float verticalPos;
uniform sampler2D uFFTTexture;
varying vec3 vPosition;
float  lowFreqIntensity;
float midFreqIntensity;
float highFreqIntensity;
uniform float uTriangleWavePoints[TRIANGLE_WAVE_SEGMENTS * 3];
uniform float uFFTData[256];



float rand(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 generateRandomness(vec3 position, float uTime) {
    return vec3(rand(position.xy * uTime), rand(position.yz * uTime), rand(position.zx * uTime));
}



// function to calculate mouse force
vec3 calculateMouseForce(vec3 particlePosition, vec2 mousePosition, float mouseInfluenceRadius, float mouseInfluenceStrength) {
    vec2 normalizedMousePos = mousePosition * 2.0 - 1.0; // Normalize mouse position to range [-1, 1]
    vec3 mousePos3D = vec3(normalizedMousePos, 0.0); // Convert to 3D space
    vec3 direction = mousePos3D - particlePosition;
    float distance = length(direction);

    if (distance < mouseInfluenceRadius) {
        float strengthFactor = (1.0 - distance / mouseInfluenceRadius)*10.0; // Gradual influence based on distance
        return mouseInfluenceStrength * normalize(direction) * strengthFactor;
    }

    return vec3(0.0, 0.0, 0.0);
}


// Function to calculate repulsion force
vec3 calculateRepulsionForce(vec3 position, vec3 otherPosition, float repulsionStrength, float influenceRadius) {
    vec3 direction = position - otherPosition;
    float distance = length(direction);
    if (distance < influenceRadius) {
        return repulsionStrength * normalize(direction) / (distance * distance);
    }
    return vec3(0.0, 0.0, 0.0);
}

// Function to calculate attraction force
vec3 calculateAttractionForce(vec3 position, vec3 targetPosition, float attractionStrength, float influenceRadius) {
    vec3 direction = targetPosition - position;
    float distance = length(direction);
    if (distance < influenceRadius) {
    return attractionStrength * normalize(direction) / distance;
    }
    return vec3(0.0, 0.0, 0.0);
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


float getSmoothedFFTValue(float phase) {
    float smoothedValue = 0.0;
    int range = 30; // Number of neighboring FFT bins to consider for smoothing

    for (int i = -range; i <= range; ++i) {
        int fftIndex = int(phase * 255.0) + i;
        fftIndex = clamp(fftIndex, 0, 255); // Ensure index stays within bounds
        smoothedValue += texture2D(uFFTTexture, vec2(float(fftIndex) / 255.0, 0.5)).r;
    }

    return smoothedValue / float(range * 2 + 1);
}


//MOTION FUNCTIONS

vec3 applySpiralMotionScribble(vec3 position, float phase, float deltaTime, float uTime) {
    float radius = 1.0 + length(position.xyz);
    float angle = ceil((phase + uTime * position.z));


    float wavyFactor = floor(cos(uTime + phase + 10.0)) * 5.515; // Adjust for more or less waviness
    float heightFactor = floor(cos((uTime*3.0) + phase + wavyFactor));

    // Modify the original spherical motion to be more irregular
    position.x = radius * sin(angle + wavyFactor) * cos(heightFactor);
    position.y = radius * sin(heightFactor + wavyFactor);
    position.z = cos(radius * cos(angle + wavyFactor) * acos(heightFactor));



    return position * 1.5;
}


vec3 applyJitterMotion(vec3 position) {
    // Adding more randomness
    float randX = random(position.xy + phase) * 2.0 - 1.0; // Random value between -1 and 1
    float randY = random(position.yz + phase) * 2.0 - 1.0; 
    float randZ = random(position.xz + phase) * 2.0 - 1.0; 

    // Jitter amplitude based on random factors and velocity
    float jitterAmplitudeX = (randX * velocity.x) * 0.20; // Control amplitude with velocity
    float jitterAmplitudeY = (randY * velocity.y) * 0.20; 
    float jitterAmplitudeZ = (randZ * velocity.z) * 100.0; 

    // Applying jitter motion with sine function for smoothness
    position.x += sin(uTime + phase) * jitterAmplitudeX;
    position.y += sin(uTime + phase) * jitterAmplitudeY;
    position.z += sin(uTime + phase) * jitterAmplitudeZ;

    return position;
}




vec3 applyBouncingMotion(vec3 position) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration;
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);

    // Normalize phase from 0 - 2*PI to 0 - 1
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);

    // Sample FFT texture based on normalizedPhase
    float fftValue = getSmoothedFFTValue(normalizedPhase)*2.0;
   

    // Modulate the amplitude with the FFT data
    float amplitude = fftValue*13.0; // scaling factor
    float bounceHeight = 30.0;
    float horizontalMovement = 3.0;
    float verticalMovement = 3.0;

    position.y += sin(abs(sin(uTime + phase)) * bounceHeight - 4.5) * amplitude;
    position.x += ceil(sin(uTime * 4.5 +(phase + 10.0)) * (horizontalMovement+10.0));
    position.z += -atan(uTime * 1.5 + (phase + 5.0)) * sin(verticalMovement);

    return position/4.5;
}



vec3 applyRoundMotion(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    // Adjust time with startOffset and wrap it with modulo
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration; 

    // Use smoothstep for easing
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);
    
    float radius = 1.5 + phase * easedT; // Varying radius based on phase
    float angle = (uTime + phase * easedT) * 6.28318530718; // Full rotation
    position.x = sqrt(atan(angle) * radius) - 10.0;
    position.y += cos(angle) / radius;
    position.z = atan(sqrt(log(angle * 8.0) + radius)) ;
    return atan(tan((position * 2.0)))*2.5 * easedT;

}




vec3 applyRoundMotionFFT(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop


    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration;
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);


    // Normalize phase 
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);

    // Sample FFT texture based on normalizedPhase
    float fftValue = getSmoothedFFTValue(normalizedPhase)*2.0;
   


    // Modulate the amplitude with the FFT data
    float amplitude = fftValue * 1.0; // scaling factor


    float bounceHeight = 1.0;
    float horizontalMovement = 3.0;
    float verticalMovement = 3.0;


    float radius = 1.5 + phase * easedT ;
    float angle = (easedT + phase) * 10.3;
    
    position.x = ceil(sin(uTime +(phase)) * (horizontalMovement+10.0));
    position.y += tanh(cos(angle ) / radius * bounceHeight) * amplitude * 2.0 ; 
    position.z = atan(((-angle * 1.0) + radius));

    return atan(tan((position * 2.0))) *2.0 * easedT;
}




vec3 applyTriangleWaveMotionV4(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0;
    float startOffset = 2.5;
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration;
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);
    float normalizedPhase = phase / (4.0 * pi);
    float fftValue = getSmoothedFFTValue(normalizedPhase); 
    float amplitude = fftValue * 2.0; // Adjust the amplitude scaling factor as needed

    // Modulate phase with time to create the dynamic wave effect
    float dynamicPhase = normalizedPhase + sin(uTime * 0.1); 
    // Triangle wave parameters
    float period = 2.0; // Defines the width of one cycle of the triangle wave
    float sharpness = 50.0; // Increase this value for sharper transitions
    float scaledTime = (dynamicPhase) * sharpness;

    float triangleWave = abs(2.0 * (scaledTime / period - floor(scaledTime / period + 0.5))) - 1.0;
    triangleWave = amplitude * (1.0 - triangleWave); // Flip the wave to peak in the positive y direction

    // Apply the triangle wave to the y position
    position.y += triangleWave;

    // Map the phase to the full length of the x-axis
    float xLength = 10.0; 
    position.x = normalizedPhase * xLength - (xLength / 2.0) + 2.5 ; // Center the wave on the screen

    position.z = 0.0;
    

    return position;
}




vec3 applyRoundComplexMotion(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration;
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);

    // Normalize phase from 0 - 2*PI to 0 - 1
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);

    // Sample FFT texture based on normalizedPhase
    float fftValue = getSmoothedFFTValue(normalizedPhase) * 3.0;
   

    // Modulate the amplitude with the FFT data
    float amplitude = fftValue * 1.0; // scaling factor

    float radius = 1.5 + phase * easedT;
    float angle = (easedT + phase) * 17.3;
    
    position.x = sqrt(atan(angle) * radius * easedT)*1.5;
    position.y += (cos(angle ) / radius) * amplitude * 2.0 ; // Apply FFT data to Y position
    position.z = atan(((-angle * 1.0) + radius));

    return atan(tan((position * 2.0))) * 2.0 * easedT;

}





vec3 applyTriangleMotion(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    // Adjust time with startOffset and wrap it with modulo
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration; 

    // Use smoothstep for easing
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);
    // Normalize phase from 0 - 2*PI to 0 - 1
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);

    // Sample FFT texture based on normalizedPhase

    float fftValue = getSmoothedFFTValue(normalizedPhase) * 2.0;
   

    // Modulate the amplitude with the FFT data
    float amplitude = fftValue; //  scaling factor

    float radius = 1.5 + phase * easedT; // Varying radius based on phase
    float angle = (easedT + phase) * 26.0; // Full rotation
    position.x = sqrt(atan(angle) * radius * easedT) *1.5;
    position.y += (cos(angle)) / radius * amplitude * 2.0;
    position.z = atan((-angle * 8.0) + radius);
    return atan(tan((position * 2.0+ (amplitude * .15))))*2.0 * easedT;

}


vec3 applyKikiGrassMotion(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    // Adjust time with startOffset and wrap it with modulo
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration; 


    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);
    float dynamicPhase = normalizedPhase + sin(uTime * 0.8); 

    float fftValue = getSmoothedFFTValue(dynamicPhase/5.0) * 1.0;
    float swirlRadius = ((fract(easedT * dynamicPhase) * 2.50));
    float angle = cos(ceil((uTime *10.5) * dynamicPhase + swirlRadius));


    position.x += (cos( 10.0 * dynamicPhase))*4.5;
    position.z += (sin(angle));
    position.y += (cos(dynamicPhase + swirlRadius) * 4.0); // Vertical oscillation



    return position * .5;

}

vec3 applySphericalMotion(vec3 position, float phase, float uTime) {
    // Original spherical motion calculations

    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    // Adjust time with startOffset and wrap it with modulo
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration; 


    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);
    float dynamicPhase = normalizedPhase + (sin(uTime * 1.8)); 

    float fftValue = getSmoothedFFTValue(dynamicPhase/5.0) * 1.0;
    float randomOffset = random(initialPosition.xy + phase); // Add randomness
    float angle = ceil(uTime*2.0 + dynamicPhase * 30.0 + (tan(uTime) + randomOffset)); // Unique angle with randomness

    // Varying radius based on initial position and random factor
    float radiusX = (2.0 + initialPosition.x * 0.5 + (sin( dynamicPhase )));
    float radiusY = 2.0 + initialPosition.y * 0.5 + (sin(dynamicPhase ));
    float radiusZ = 2.0 + initialPosition.z * 0.5 + tan(dynamicPhase);

    position.x += cos(angle) *radiusX;
    position.y += sin(angle) *radiusY;
    position.z += cos( radiusZ) * 1.0;



    return position * .55;
}

vec3 applySphericalMotionListening(vec3 position, float phase, float uTime) {
    // Original spherical motion calculations

    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    // Adjust time with startOffset and wrap it with modulo
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration; 


    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);
    float dynamicPhase = normalizedPhase + (sin(uTime * 1.8)); 

    float fftValue = getSmoothedFFTValue(dynamicPhase/5.0) * 1.0;
    float randomOffset = random(initialPosition.xy + phase); // Add randomness
    float angle = floor(uTime*2.0 + dynamicPhase * 9.0 + tan(uTime)); // Unique angle with randomness

    // Varying radius based on initial position and random factor
    float radiusX = (2.0 + initialPosition.x * 0.5 + abs(sin( dynamicPhase )));
    float radiusY = 2.0 + initialPosition.y * 0.5 + abs(sin(dynamicPhase ));
    float radiusZ = 2.0 + initialPosition.z * 0.5 + (dynamicPhase);

    position.x += cos(angle) *radiusX;
    position.y += sin(angle) *radiusY;
    //position.z += sin( radiusZ);



    return position * .55;
}



vec3 applyHardMotion(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    // Adjust time with startOffset and wrap it with modulo
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration; 

    // Use smoothstep for easing
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);

    // Normalize phase from 0 - 2*PI to 0 - 1
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);

    // Sample FFT texture based on normalizedPhase

    float fftValue = getSmoothedFFTValue(normalizedPhase/10.0) * 20.0;

        // Modulate the amplitude with the FFT data
    float amplitude = fftValue *.5; //  scaling factor

    
    
    
    float radius = 0.5525 + phase * easedT * 0.50; // Varying radius based on phase
    float angle = (uTime + phase * easedT) * 6.288; // Full rotation
    position.x = ((atan(angle) * radius));
    position.y = tanh((cos(angle) / radius *.5) * (amplitude ));
    position.z -=atan(((angle * 1.0) + radius)) + 5.0;
    return atan(tan((position * 2.0)))*2.0 * easedT;

}

vec3 applyHardTriangleMotion(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop

    // Adjust time with startOffset and wrap it with modulo
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration; 

    // Use smoothstep for easing
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);

    // Normalize phase from 0 - 2*PI to 0 - 1
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);

    // Sample FFT texture based on normalizedPhase

    float fftValue = getSmoothedFFTValue(normalizedPhase/10.0) * 20.0;

    // Modulate the amplitude with the FFT data
    float amplitude = fftValue *.35; //  scaling factor
    float dynamicPhase = normalizedPhase + sin(uTime * 0.1); 

    float period = 1.0; // Defines the width of one cycle of the triangle wave
    float sharpness = 50.0; // Increase this value for sharper transitions
    float scaledTime = (dynamicPhase) * sharpness;


    float triangleWave = abs(2.0 * (scaledTime / period - floor(scaledTime / period + 0.5))) - 1.0;
    triangleWave = amplitude * (1.0 - triangleWave); // Flip the wave to peak in the positive y direction
    
    
    float radius = 0.5525 + phase * easedT * 0.50; // Varying radius based on phase
    float angle = (uTime + phase * easedT) * 6.288; // Full rotation
    position.x = ((atan(angle) * radius));
    position.y = tanh((cos(angle) / radius *.5) * (triangleWave ));
    position.z -=atan(((angle * 1.0) + radius));
    return atan(tan((position * 2.0)))*2.0 * easedT;

}


vec3 applyFlyingMotion(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0; // Duration of the loop
    float startOffset = 2.5; // Start halfway through the loop


    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration; 

    // Use smoothstep for easing
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);

    float radius = (1.5 + phase * easedT); // Varying radius based on phase
    float angle = (uTime + phase) * 6.28318530718; // Full rotation
    position.x = sqrt(atan(angle) * radius *(uTime*.5)) - 10.0;
    position.y += (tan(cos(angle)) / radius);
    position.z = (atan(sqrt((angle * 8.0) + radius)));
    return atan(tan((position + phase* 2.0)))*1.0;

}

vec3 applySquareWaveMotion(vec3 position, float phase, float uTime) {
    float loopDuration = 30.0;
    float startOffset = 2.5;
    float t = mod(uTime + startOffset * loopDuration, loopDuration) / loopDuration;
    float easedT = smoothstep(0.0, 0.01, t) * smoothstep(1.0, 0.99, t);
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);
    float fftValue = getSmoothedFFTValue(normalizedPhase); 
    float amplitude = fftValue * 3.0;

   
    float period = 2.0; 
    float scaledTime = (normalizedPhase + (uTime * 0.5)) * (2.0 / period);

  
    float squareWave = step(0.5, mod(scaledTime, 1.0)) * 2.0 - 1.0;
    squareWave *= amplitude; 

    // Apply the square wave to the y position
    position.y += squareWave;

    // Map the already normalized phase to the full length of the x-axis
    float xLength = 5.0; 
    position.x = normalizedPhase * xLength - (xLength / 2.0); // Map phase to screen space


    position.z = 0.0;

    return position;
}




/// NEW SYSTEM /// 
vec3 getPositionBasedOnType(int type, vec3 position) {
    switch(type) {
        case 1: return applyRoundComplexMotion(position, phase, uTime);
        case 9: return applySpiralMotionScribble(position, phase, deltaTime, uTime);
        case 5: return applySquareWaveMotion(position, phase, uTime);
        case 8: return applyFlyingMotion(position, phase, uTime);
        case 4: return applySphericalMotion(position, phase, uTime);
        case 3: return applyHardMotion(position, phase, uTime);
        case 6: return applySphericalMotion(position, phase, uTime);
        case 7: return applyBouncingMotion(position);
        case 0: return applyRoundMotionFFT(position, phase, uTime);
        case 2: return applyHardTriangleMotion(position, phase, uTime);
        default: return initialPosition;
    }
}



void main() {

    vUv = uv;
    // Calculate position based on motion type
    vec3 motionPosition = getPositionBasedOnType(motionType, initialPosition);

    // Apply the interaction forces with key particles to the original position
    vec3 forcePosition = initialPosition;
    for (int i = 0; i < NUM_KEY_PARTICLES; i++) {
        float distance = length(forcePosition - keyParticlePositions[i]);
        if (distance < keyParticleInfluenceRadius[i]) {
            forcePosition += calculateRepulsionForce(forcePosition, keyParticlePositions[i], repulsionStrength, keyParticleInfluenceRadius[i]);
            forcePosition += calculateAttractionForce(forcePosition, keyParticlePositions[i], attractionStrength, keyParticleInfluenceRadius[i]);
        }
    }

    // Combine motion position with force-influenced position
    float forceInfluenceFactor = 1.0; // Adjust this value between 0.0 and 1.0
    vec3 combinedPosition = mix(motionPosition, forcePosition, forceInfluenceFactor);

    // Interpolate between the current and next motion types based on motionBlendFactor
    vec3 currentMotionPosition = getPositionBasedOnType(motionType, combinedPosition);
    vec3 nextMotionPosition = getPositionBasedOnType(targetMotionType, combinedPosition);
    vec3 animatedPosition = mix(currentMotionPosition, nextMotionPosition, motionBlendFactor);

    // Calculate final position
    vec3 finalPosition = animatedPosition;

    

    // Set the final position to gl_Position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);

    // Pass velocity and phase to the fragment shader
    vVelocity = velocity;
    vPhase = phase;

    

    float particleRandomness = rand(resolution.xy);
    float normalizedPhase = phase / (2.0 * 3.14159265358979323846);
    
    // Calculate variability in size based on motionPosition
    float sizeVariability = 10.0 + (normalizedPhase*10.0); 




    

    // Sample FFT texture based on normalizedPhase

    float fftValue = getSmoothedFFTValue(normalizedPhase) * 3.0;
   
    float phaseOscillation =(fftValue)*2.0;

    // Calculate a smooth size variation
    float smoothSize = smoothstep(0.0, 1.05, sin(cos(cos(phase) * (phaseOscillation) * 30.0)))*8.0;
    

    gl_PointSize = 40.0 + (smoothSize * 3.0) + 5.5; 


}
