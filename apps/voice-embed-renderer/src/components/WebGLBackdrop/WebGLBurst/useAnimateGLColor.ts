import { useSpring } from "@react-spring/three";
import { expressionColors } from "expression-colors";
import { useMemo } from "react";
import { isExpressionColor } from "@/utils/isExpressionColor";

export const useAnimateGLColor = (
  emotionName: string,
  fallbackColor?: [number, number, number],
) => {
  const color = useMemo(() => {
    if (isExpressionColor(emotionName)) {
      const glColor = expressionColors[emotionName].gl;

      return [glColor[0], glColor[1], glColor[2]];
    }

    return fallbackColor ?? [0.0, 0.0, 0.0];
  }, [emotionName, fallbackColor]);

  const { r, g, b } = useSpring({
    r: color[0] ?? 0,
    g: color[1] ?? 0,
    b: color[2] ?? 0,
  });

  return { r, g, b };
};
