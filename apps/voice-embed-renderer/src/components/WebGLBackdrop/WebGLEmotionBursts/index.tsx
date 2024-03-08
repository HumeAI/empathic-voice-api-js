import { usePresence } from "framer-motion";
import { useEffect } from "react";
import { useSpring } from "@react-spring/three";
import { WebGLBurst } from "../WebGLBurst";
import { useAnimateGLColor } from "../WebGLBurst/useAnimateGLColor";

export const WebGLEmotionBursts = ({
  prosody,
}: {
  prosody: { name: string; score: number }[];
}) => {
  const [isPresent, safeToRemove] = usePresence();

  const [{ radius, opacity }, api] = useSpring(() => ({
    radius: 0.0,
    opacity: 0.0,
    config: {},
  }));

  useEffect(() => {
    if (!isPresent) {
      void api.start({ radius: 0.0, opacity: 0.0 });
      setTimeout(safeToRemove, 1000);
    } else {
      void api.start({ radius: 0.3, opacity: 1.0 });
    }
  }, [api, isPresent, safeToRemove]);

  const colorA = useAnimateGLColor(prosody[0]?.name ?? "", [0.96, 0.78, 0.54]);

  const colorB = useAnimateGLColor(prosody[1]?.name ?? "", [0.96, 0.78, 0.54]);

  const colorC = useAnimateGLColor(prosody[2]?.name ?? "", [0.96, 0.78, 0.54]);

  return (
    <>
      <WebGLBurst
        x={0.3}
        y={0.5}
        radius={radius}
        opacity={opacity}
        r={colorA.r}
        g={colorA.g}
        b={colorA.b}
      />
      <WebGLBurst
        x={0.5}
        y={0.75}
        radius={radius}
        opacity={opacity}
        r={colorB.r}
        g={colorB.g}
        b={colorB.b}
      />
      <WebGLBurst
        x={0.6}
        y={0.45}
        radius={radius}
        opacity={opacity}
        r={colorC.r}
        g={colorC.g}
        b={colorC.b}
      />
    </>
  );
};
