import { create } from 'zustand';

type AuthStrategy =
  | {
      type: 'apiKey';
      value: string;
    }
  | {
      type: 'accessToken';
      value: string;
    };
interface ConfigStore {
  authStrategy: AuthStrategy | null;
  setAuthStrategy: (authStrategy: AuthStrategy) => void;
  clearAuthStrategy: () => void;
}

export const useConfigStore = create<ConfigStore>()((set) => ({
  authStrategy: null,
  setAuthStrategy: (authStrategy) => set({ authStrategy }),
  clearAuthStrategy: () => set({ authStrategy: null }),
}));
