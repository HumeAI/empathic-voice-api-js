import { expressionColors } from "expression-colors";

export function isExpressionColor(
  s: string | number | symbol,
): s is keyof typeof expressionColors {
  return s in expressionColors;
}
