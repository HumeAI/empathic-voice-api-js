/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from 'three';

import { expressionColors } from 'expression-colors';
import vertexShader from './shaders/vertex.glsl?raw';
import fragmentShader from './shaders/fragment.glsl?raw';
import screenQuadVertexShader from './shaders/screenQuadVertexShader.glsl?raw';
import blendFragmentShader from './shaders/blendFragmentShader.glsl?raw';
import { isExpressionColor } from '@/utils/isExpressionColor';
import { EmotionScores } from '@humeai/voice-embed-react';

export enum AvatarState {
  LISTENING = 0,
  IDLE = 9,
  KIKI = 2,
  BOUBA = 3,
  THINKING = 4,
}

export class AvatarVisualization {
  private container: HTMLDivElement;
  private w: number;
  private h: number;

  private scene: THREE.Scene | undefined;
  private camera: THREE.PerspectiveCamera | undefined;
  private renderer: THREE.WebGLRenderer | undefined;
  private frameId: number | null = null;

  private particleSystem:
    | THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
    | undefined;

  private smileUniforms = {
    curvature: { value: 2.0 },
    width: { value: 4.0 },
    verticalPos: { value: -1.0 },
    mouthOpening: { value: 0.0 },
  };

  private lastTime: number = performance.now();
  private currentMotionType: number = 4; // Default motion type
  private targetMotionType: number = 9; // Initialize with the same value as currentMotionType
  private transitioning: boolean = false;
  private motionBlendFactor: { value: number } = { value: 0.0 };
  private lowRangeStart: number = 0;
  private lowRangeEnd: number = 0;
  private midRangeStart: number = 0;
  private midRangeEnd: number = 0;
  private highRangeStart: number = 0;
  private highRangeEnd: number = 0;
  private quadScene: THREE.Scene | undefined;
  private quadCamera: THREE.OrthographicCamera | undefined;
  private quadMesh: THREE.Mesh | undefined;
  private quadGeometry = new THREE.PlaneGeometry(2, 2);
  private currentTime: number = 0.0;
  private quadMaterial: THREE.ShaderMaterial | undefined;
  private currentRenderTarget: THREE.WebGLRenderTarget;
  private previousRenderTarget: THREE.WebGLRenderTarget;
  private MAX_EMOTIONS: number = 3;
  private material: THREE.ShaderMaterial | undefined;
  private particleCount: number;
  private lifetimes: Float32Array;
  private isRotationActive: boolean = false;
  private particleSize: { value: number } = { value: 1.0 };
  private uTime: { value: number } = { value: 0.0 };
  private static TRIANGLE_WAVE_SEGMENTS: number = 50;
  private triangleWavePoints: Float32Array;
  private fftHistory: number[][] = [];
  private historyLength: number = 8;
  private staticPositions: THREE.Vector3[] = [
    new THREE.Vector3(-2.5, 1.0, 0.0),
    new THREE.Vector3(2.5, 0.0, 0.0),
    new THREE.Vector3(0.0, 2.5, 0.0),
    new THREE.Vector3(0.0, -2.5, 0.0),
  ];
  private keyParticlePositions: THREE.Vector3[] = [
    new THREE.Vector3(-2.5, 1.0, 0.0),
    new THREE.Vector3(2.5, 0.0, 0.0),
    new THREE.Vector3(0.0, 2.5, 0.0),
    new THREE.Vector3(0.0, -2.5, 0.0),
  ];
  private keyParticleInfluenceRadii: number[] = [];
  private renderTargetParams: THREE.RenderTargetOptions = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
  };

  private renderTargets: THREE.WebGLRenderTarget[] = [];
  private numRenderTargets: number = 5;

  constructor({
    container,
    width,
    height,
  }: {
    width: number;
    height: number;
    container: HTMLDivElement;
  }) {
    this.container = container;

    this.triangleWavePoints = new Float32Array(
      AvatarVisualization.TRIANGLE_WAVE_SEGMENTS * 3,
    );

    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Initialize render targets with adjusted sizes
    this.currentRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * pixelRatio,
      window.innerHeight * pixelRatio,
      this.renderTargetParams,
    );
    this.previousRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * pixelRatio,
      window.innerHeight * pixelRatio,
      this.renderTargetParams,
    );

    // Apply the same adjustment for all render targets in the loop
    for (let i = 0; i < this.numRenderTargets; i++) {
      this.renderTargets.push(
        new THREE.WebGLRenderTarget(
          window.innerWidth * pixelRatio,
          window.innerHeight * pixelRatio,
          this.renderTargetParams,
        ),
      );
    }

    this.particleCount = 5000;
    this.lifetimes = new Float32Array(this.particleCount);

    this.w = width;
    this.h = height;

    // Initialize renderer with antialiasing enabled
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0); // Set clear color with alpha
  }

  start() {
    this.setupThree();
    this.frameId = requestAnimationFrame(this.animate);
  }

  private processAudio = (fftData: number[]) => {
    const windowedFFTData: Float32Array = this.applyWindow(fftData);
    const windowedFFTDataArray: number[] = Array.from(windowedFFTData);

    this.fftHistory.push(windowedFFTDataArray.slice());
    if (this.fftHistory.length > this.historyLength) {
      this.fftHistory.shift();
    }

    const averagedFFTData = new Float32Array(windowedFFTData.length);
    for (let i = 0; i < windowedFFTData.length; i++) {
      let sum = 0;
      for (let j = 0; j < this.fftHistory.length; j++) {
        sum += this.fftHistory[j]?.[i] ?? 0;
      }
      averagedFFTData[i] = sum / this.fftHistory.length;
    }

    // Update FFT texture with the averaged data
    if (this.material) {
      this.material.uniforms.uFFTTexture.value.image.data.set(averagedFFTData);
      this.material.uniforms.uFFTTexture.value.needsUpdate = true;
    }

    // Calculate average intensity for different frequency ranges
    const lowFreqIntensity = this.computeAverage(
      averagedFFTData,
      this.lowRangeStart,
      this.lowRangeEnd,
    );
    const midFreqIntensity = this.computeAverage(
      averagedFFTData,
      this.midRangeStart,
      this.midRangeEnd,
    );
    const highFreqIntensity = this.computeAverage(
      averagedFFTData,
      this.highRangeStart,
      this.highRangeEnd,
    );

    // Update uniform values for particle system
    if (this.particleSystem?.material) {
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.lowFreqIntensity.value =
        lowFreqIntensity;
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.midFreqIntensity.value =
        midFreqIntensity;
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.highFreqIntensity.value =
        highFreqIntensity;
    }
  };

  updateFFT = (fft: number[]): void => {
    this.processAudio(fft);
  };

  getEmotionColor = (emotion: string): [number, number, number] => {
    if (isExpressionColor(emotion)) {
      const [r, g, b] = expressionColors[emotion].gl;
      return [r, g, b];
    }
    return [0.0, 0.0, 0.0];
  };

  updateProsody = (prosody: EmotionScores): void => {
    // Sort prosody data to find the top 3 emotions based on their scores
    const top3 = Object.entries(prosody)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, value]) => ({ name: key, score: value }));

    // Retrieve the corresponding colors for the top 3 emotions
    const colorA = this.getEmotionColor(top3[0]?.name ?? '');
    const colorB = this.getEmotionColor(top3[1]?.name ?? '');
    const colorC = this.getEmotionColor(top3[2]?.name ?? '');

    // Update shader uniforms for emotion colors
    if (this.particleSystem?.material) {
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.uEmotionColorA.value =
        new THREE.Vector3(...colorA);
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.uEmotionColorB.value =
        new THREE.Vector3(...colorB);
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.uEmotionColorC.value =
        new THREE.Vector3(...colorC);

      // Also update shader uniforms for the scores of the top 3 emotions
      // Assuming the scores could be undefined, default to 0 if so
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.uEmotionScoreA.value =
        top3[0]?.score ?? 0;
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.uEmotionScoreB.value =
        top3[1]?.score ?? 0;
      //@ts-ignore-next-line
      this.particleSystem.material.uniforms.uEmotionScoreC.value =
        top3[2]?.score ?? 0;

      this.particleSystem.material.needsUpdate = true;
    }
  };

  destroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.cleanUpThree();
  }

  private setupParticleSystem = () => {
    const particleCount = this.particleCount;

    // Setup positions, velocities, phases, birthTimes, variations
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    const birthTimes = new Float32Array(particleCount);
    const variations = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      variations[i] = Math.random(); // or any other variation logic
    }

    for (let i = 0; i < particleCount; i++) {
      // Set positions and velocities
      positions[i * 3] = (Math.random() * 2 - 1) * 500;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 500;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * 500;
      velocities[i * 3] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      for (let i = 0; i < particleCount; i++) {
        phases[i] = Math.random() * Math.PI * 2; // Random phase for each particle
      }
      // Set birth time for each particle
      birthTimes[i] = this.currentTime; // Or any other appropriate value for birth time
    }

    // Create the buffer geometry and set attributes
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute(
      'birthTime',
      new THREE.BufferAttribute(birthTimes, 1),
    ); // Add birth times as an attribute
    geometry.setAttribute(
      'lifetime',
      new THREE.BufferAttribute(this.lifetimes, 1),
    );
    geometry.setAttribute(
      'variation',
      new THREE.BufferAttribute(variations, 1),
    );

    // Define the ShaderMaterial
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      uniforms: {
        // Define uniforms...
        uTime: { value: 0.0 },
        motionBlendFactor: { value: 0.0 },
        uCurrentTime: { value: 0.0 },
        motionType: { value: this.currentMotionType },
        targetMotionType: { value: this.targetMotionType },
        uBlurDirection: { value: new THREE.Vector3(0, 0, 0) },
        uParticleSize: { value: this.particleSize.value },
        uPrevMouse: { value: new THREE.Vector2(-1, -1) },
        uIsAttractionActive: { value: false },
        uIsRepulsionActive: { value: false },
        keyParticlePositions: { value: this.keyParticlePositions },
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        keyParticleInfluenceRadii: { value: this.keyParticleInfluenceRadii },
        maxMouseDistance: { value: 100.0 },
        basePointSize: { value: 1.0 },
        uAudioData: { value: 0.0 },
        variations: { value: variations },
        curvature: { value: 2.0 },
        width: { value: 4.0 },
        verticalPos: { value: -1.0 },
        mouthOpening: { value: 0.0 },
        uFFTTexture: { value: null },
        uEmotionColorA: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
        uEmotionColorB: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
        uEmotionColorC: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
        uEmotionScoreA: { value: 0.0 },
        uEmotionScoreB: { value: 0.0 },
        uEmotionScoreC: { value: 0.0 },
        currentEmotionState: { value: 0.0 },
        lowFreqIntensity: { value: 0 },
        midFreqIntensity: { value: 0 },
        highFreqIntensity: { value: 0 },
        uEmotionState: { value: 0.0 },
        emotionMotionTypes: { value: new Array(this.MAX_EMOTIONS).fill(-1) },
        isSingleEmotion: { value: false },
        targetEmotionState: { value: 0.0 },
        uTriangleWavePoints: { value: this.triangleWavePoints },
        emotionBlendFactor: { value: 0.0 },
        mouseDistanceFactor: { value: 0.5 },
        deltaTime: { value: 0.0 },
      },
    });

    // Create the particle system and add it to the scene
    this.particleSystem = new THREE.Points(geometry, this.material);
    this.scene?.add(this.particleSystem);
    // Initialize FFT texture
    const fftSize = 512; // Example FFT size, adjust as needed
    const fftTexture = new THREE.DataTexture(
      new Float32Array(fftSize),
      fftSize,
      1,
      THREE.RedFormat,
      THREE.FloatType,
    );
    fftTexture.needsUpdate = true;

    // Assign FFT texture to material uniforms
    this.material.uniforms.uFFTTexture = { value: fftTexture };
  };

  private computeAverage = (
    dataArray: Float32Array | Uint8Array,
    start: number,
    end: number,
  ): number => {
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += dataArray[i] ?? 0;
    }
    return sum / (end - start);
  };

  private applyWindow = (
    fftData: number[],
    emphasisStart = 0.3,
    emphasisCurve = 3,
  ): Float32Array => {
    // Convert to method implementation
    const windowedData = new Float32Array(fftData.length);
    for (let i = 0; i < fftData.length; i++) {
      // Apply a non-linear high-pass windowing function
      const relativePosition = i / fftData.length; // Position of the bin relative to the total number of bins
      const weight =
        relativePosition < emphasisStart
          ? // Below the emphasis start, apply a lower weight
            Math.pow(relativePosition / emphasisStart, emphasisCurve)
          : // Above the emphasis start, scale the weight non-linearly
            1 -
            Math.pow(
              (1 - relativePosition) / (1 - emphasisStart),
              emphasisCurve,
            );

      windowedData[i] = (fftData[i] ?? 0) * weight;
    }
    return windowedData;
  };

  startTransitionTo = (newMotionType: AvatarState) => {
    if (
      Number(newMotionType) < 0 ||
      Number(newMotionType) > 9 ||
      newMotionType.toString() === this.currentMotionType.toString()
    ) {
      console.warn('Invalid or same motion type:', newMotionType.toString());
      return;
    }
    if (!this.transitioning) {
      this.targetMotionType = newMotionType;
      this.transitioning = true;
      this.motionBlendFactor.value = 0.0; // Start the blend from zero
    }
  };

  updateTransition = () => {
    if (!this.transitioning) return;

    const blendSpeed = 0.035; // Adjust this speed as necessary
    this.motionBlendFactor.value += blendSpeed;

    if (this.motionBlendFactor.value >= 1.0) {
      this.motionBlendFactor.value = 1.0;
      this.currentMotionType = this.targetMotionType;
      this.transitioning = false;
      // Update any dependent uniforms or state here
    }
  };

  updateUniforms = () => {
    // Assuming `quadMaterial` is accessible in the current context
    // and `influences` array is either a constant or part of the component's state
    const influences = [
      0.99, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.04, 0.03, 0.02,
      0.01, 0.0,
    ];

    // Ensure `quadMaterial` is initialized and has the `uniforms` property

    if (this.quadMaterial) {
      // @ts-ignore-next-line
      this.quadMaterial.uniforms.textureInfluence.value = influences;
      // @ts-ignore-next-line
      this.quadMaterial.uniforms.blendColor.value = new THREE.Vector4(
        1,
        1,
        1,
        1,
      );
      // @ts-ignore-next-line
      this.quadMaterial.uniforms.blendSharpness.value = 0.45;
    }
  };

  resize = (width: number, height: number) => {
    this.w = width;
    this.h = height;

    // Determine the display's pixel ratio, but cap it to a maximum of 2 for performance reasons
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Update the renderer's size with the new dimensions and pixel ratio
    if (this.renderer) {
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setSize(width, height);
    }

    // Update the perspective camera's aspect ratio and projection matrix
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    // If you are using an orthographic camera for post-processing or other purposes,
    // you may need to adjust its frustum parameters here as well
    if (this.quadCamera instanceof THREE.OrthographicCamera) {
      const aspect = width / height;
      const frustumHeight = 2; // This value depends on your specific needs
      this.quadCamera.left = (-frustumHeight * aspect) / 2;
      this.quadCamera.right = (frustumHeight * aspect) / 2;
      this.quadCamera.top = frustumHeight / 2;
      this.quadCamera.bottom = -frustumHeight / 2;
      this.quadCamera.updateProjectionMatrix();
    }

    // Adjust the resolution uniform for shaders that depend on screen size
    if (this.quadMaterial && this.quadMaterial.uniforms.resolution) {
      this.quadMaterial.uniforms.resolution.value.set(
        width * pixelRatio,
        height * pixelRatio,
      );
    }

    // Ensure all render targets are also resized to reflect the new dimensions and pixel ratio
    // This is critical for any post-processing effects to maintain their quality
    const renderTargetWidth = width * pixelRatio;
    const renderTargetHeight = height * pixelRatio;
    this.currentRenderTarget.setSize(renderTargetWidth, renderTargetHeight);
    this.previousRenderTarget.setSize(renderTargetWidth, renderTargetHeight);
    this.renderTargets.forEach((rt) => {
      rt.setSize(renderTargetWidth, renderTargetHeight);
    });
  };

  setupThree() {
    const width = this.w;
    const height = this.h;

    this.scene = new THREE.Scene();

    // Adjust the camera to use the mount dimensions instead of window
    const aspectRatio = width / height;
    this.camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
    this.camera.position.z = 5;

    // Set the pixel ratio to the device's pixel ratio
    if (this.renderer) {
      this.renderer.setPixelRatio(window.devicePixelRatio);

      // Update renderer size to match the canvas element's size
      this.renderer.setSize(width, height);

      // Append renderer to the mount point in the DOM
      this.container.appendChild(this.renderer.domElement);
    }

    // Update camera's aspect ratio to match the new size
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();

    // Initialize quadScene, quadCamera, and quadMesh with materials and uniforms
    this.quadScene = new THREE.Scene();
    this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quadGeometry = new THREE.PlaneGeometry(2, 2);
    this.quadMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textures: { value: Array(15).fill(null) },
        blendFactors: { value: Array(15).fill(1.0 / 15) },
        uTime: { value: 0.0 },
        textureInfluence: { value: [] }, // Will be dynamically updated
        blendColor: { value: new THREE.Vector4(1, 1, 1, 1) },
        uEmotionColorA: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
        uEmotionColorB: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
        uEmotionColorC: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
        blendSharpness: { value: 0.2 },
        resolution: {
          value: new THREE.Vector2(width, height),
        },
      },
      vertexShader: screenQuadVertexShader,
      fragmentShader: blendFragmentShader,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    const influences = [
      0.99, // Influence value for texture 0
      0.8, // Influence value for texture 1
      0.7, // Influence value for texture 2
      0.6, // Influence value for texture 3
      0.5, // Influence value for texture 4
      0.4, // Influence value for texture 5
      0.3, // Influence value for texture 6
      0.2, // Influence value for texture 7
      0.1, // Influence value for texture 8
      0.05, // Influence value for texture 9
      0.04, // Influence value for texture 10
      0.03, // Influence value for texture 11
      0.02, // Influence value for texture 12
      0.01, // Influence value for texture 13
      0.0, // Influence value for texture 14
    ];

    // @ts-ignore-next-line
    this.quadMaterial.uniforms.textureInfluence.value = influences;
    // @ts-ignore-next-line
    this.quadMaterial.uniforms.blendColor.value = new THREE.Vector4(1, 1, 1, 1);
    // @ts-ignore-next-line
    this.quadMaterial.uniforms.blendSharpness.value = 0.25;

    this.quadMesh = new THREE.Mesh(this.quadGeometry, this.quadMaterial);
    //@ts-ignore-next-line
    this.quadScene.add(this.quadMesh);

    // Particle system setup
    this.setupParticleSystem();
    // Assign static positions to keyParticlePositions
    this.keyParticlePositions = this.staticPositions;
  }

  animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);

    const now = Date.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.uTime.value += deltaTime;

    if (this.isRotationActive && this.scene) {
      this.scene.rotation.y += 0.01;
    }

    this.updateTransition();

    // Update particle system uniforms with type assertion

    if (this.particleSystem?.material) {
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.deltaTime.value = deltaTime;
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.uTime.value += 0.01;
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.motionBlendFactor.value =
        this.motionBlendFactor.value;
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.motionType.value =
        this.currentMotionType;
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.targetMotionType.value =
        this.targetMotionType;

      // Update uniforms related to smile/emotion with type assertion
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.curvature.value =
        this.smileUniforms.curvature.value;
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.width.value =
        this.smileUniforms.width.value;
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.verticalPos.value =
        this.smileUniforms.verticalPos.value;
      // @ts-ignore-next-line
      this.particleSystem.material.uniforms.mouthOpening.value =
        this.smileUniforms.mouthOpening.value;
    }

    this.updateUniforms();

    if (this.renderer && this.scene && this.camera) {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
    }
  };

  cleanUpThree() {
    if (this.renderer?.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
