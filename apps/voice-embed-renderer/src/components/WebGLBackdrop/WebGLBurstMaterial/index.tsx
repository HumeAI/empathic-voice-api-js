import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { animated } from "@react-spring/three";

const WebGLBurstShaderMaterial = shaderMaterial(
  {
    u_offsetX: 0.5,
    u_offsetY: -1.0,
    u_radius: 0.0,
    u_opacity: 0.0,
    u_colorR: 0.96,
    u_colorG: 0.78,
    u_colorB: 0.54,
  },
  `
        varying vec2 vUv;
    
        void main() {
            vUv = uv;
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
    
            gl_Position = projectedPosition;
        }
      `,
  `
        varying vec2 vUv;
    
        uniform float u_offsetX;
        uniform float u_offsetY;
        uniform float u_radius;
        uniform float u_opacity;
        uniform float u_colorR;
        uniform float u_colorG;
        uniform float u_colorB;
    
        void main() {
            vec2 pos = vec2(u_offsetX, u_offsetY);
            float dist = distance(vUv, pos);
            float alpha = u_radius - dist;
    
            gl_FragColor = vec4(u_colorR, u_colorG, u_colorB, alpha * u_opacity);
        }
      `,
);

extend({ WebGLBurstShaderMaterial: WebGLBurstShaderMaterial });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      webGLBurstShaderMaterial: {
        u_offsetX: number;
        u_offsetY: number;
        u_radius: number;
        u_opacity: number;
        u_colorR: number;
        u_colorG: number;
        u_colorB: number;
      } & JSX.IntrinsicElements["shaderMaterial"];
    }
  }
}

export const WebGLBurstMaterial = animated(
  ({
    ...props
  }: {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    r: number;
    g: number;
    b: number;
  }) => {
    return (
      <webGLBurstShaderMaterial
        attach="material"
        transparent={true}
        u_offsetX={props.x}
        u_offsetY={props.y}
        u_radius={props.radius}
        u_opacity={props.opacity}
        u_colorR={props.r}
        u_colorG={props.g}
        u_colorB={props.b}
      />
    );
  },
);
