export const flushPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
