import { create } from 'zustand';

interface ConfigStore {
  apiKey: string | null;
  setApiKey: (apiKey: string) => void;
  clearApiKey: () => void;
}

export const useConfigStore = create<ConfigStore>()((set) => ({
  apiKey: null,
  setApiKey: (apiKey) => set({ apiKey }),
  clearApiKey: () => set({ apiKey: null }),
}));
