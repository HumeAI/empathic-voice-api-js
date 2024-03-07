import { useThree } from "@react-three/fiber";
import { ComponentProps, FC } from "react";
import { type SpringValue } from "@react-spring/three";
import { WebGLBurstMaterial } from "../WebGLBurstMaterial";

export type WebGLBurstProps = {
  x: ComponentProps<typeof WebGLBurstMaterial>["x"];
  y: ComponentProps<typeof WebGLBurstMaterial>["y"];
  radius: ComponentProps<typeof WebGLBurstMaterial>["radius"];
  opacity: ComponentProps<typeof WebGLBurstMaterial>["opacity"];
  r: SpringValue<number> | number;
  g: SpringValue<number> | number;
  b: SpringValue<number> | number;
};

export const WebGLBurst: FC<WebGLBurstProps> = ({
  x,
  y,
  radius,
  opacity,
  r,
  g,
  b,
}) => {
  const viewport = useThree((state) => state.viewport);

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <WebGLBurstMaterial
        x={x}
        y={y}
        radius={radius}
        opacity={opacity}
        r={r}
        g={g}
        b={b}
      />
    </mesh>
  );
};
