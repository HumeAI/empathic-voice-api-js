import pkg from '../package.json';

export const useAssistant = () => {
  const version = pkg.version;

  return {
    version,
  };
};
