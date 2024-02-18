export const safeJson = (
  input: string,
): { success: true; data: unknown } | { success: false } => {
  try {
    return { success: true, data: JSON.parse(input) as unknown };
  } catch (e) {
    return { success: false };
  }
};
