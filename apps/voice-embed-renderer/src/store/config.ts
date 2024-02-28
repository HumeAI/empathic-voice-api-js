import { Config } from '@humeai/voice-embed-react';
import { create } from 'zustand';

type config = Config;
interface ConfigStore {
  config: config | null;
  setConfig: (config: config) => void;
  clearConfig: () => void;
}

export const useConfigStore = create<ConfigStore>()((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
  clearConfig: () => set({ config: null }),
}));
