import { create } from 'zustand';
import { parentDispatch } from '../utils/parentDispatch';
import {
  COLLAPSE_WIDGET_ACTION,
  EXPAND_WIDGET_ACTION,
  MINIMIZE_WIDGET_ACTION,
  RESIZE_FRAME_ACTION,
} from '@humeai/voice-embed-react';

export enum LayoutState {
  CLOSED = 'closed',
  OPEN = 'open',
  MINIMIZED = 'minimized',
}

interface LayoutStore {
  state: LayoutState;
  open: () => void;
  close: () => void;
}

let timeout: number | undefined = undefined;

export const useLayoutStore = create<LayoutStore>()((set) => {
  return {
    state: LayoutState.CLOSED,
    open: () => {
      clearTimeout(timeout);
      parentDispatch(
        RESIZE_FRAME_ACTION({
          width: 350,
          height: 400,
        }),
      );
      parentDispatch(EXPAND_WIDGET_ACTION);
      return set({ state: LayoutState.OPEN });
    },
    close: () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        parentDispatch(
          RESIZE_FRAME_ACTION({
            width: 50,
            height: 50,
          }),
        );
      }, 300);
      parentDispatch(COLLAPSE_WIDGET_ACTION);
      return set({ state: LayoutState.CLOSED });
    },
    minimize: () => {
      clearTimeout(timeout);
      parentDispatch(
        RESIZE_FRAME_ACTION({
          width: 350,
          height: 50,
        }),
      );
      parentDispatch(MINIMIZE_WIDGET_ACTION);
      return set({ state: LayoutState.CLOSED });
    },
  };
});
