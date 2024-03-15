import { create } from 'zustand';
import { parentDispatch } from '../utils/parentDispatch';
import {
  COLLAPSE_WIDGET_ACTION,
  EXPAND_WIDGET_ACTION,
  MINIMIZE_WIDGET_ACTION,
  RESIZE_FRAME_ACTION,
  WindowDimensions,
} from '@humeai/voice-embed-react';

export enum LayoutState {
  CLOSED = 'closed',
  OPEN = 'open',
  MINIMIZED = 'minimized',
}

interface LayoutStore {
  state: LayoutState;
  frameSize: WindowDimensions;
  open: (dimensions: WindowDimensions) => void;
  setFrameSize: (dimensions: WindowDimensions) => void;
  close: () => void;
}

let timeout: number | undefined = undefined;

const DEFAULT_FRAME_WIDTH = 400;
const DEFAULT_FRAME_HEIGHT = 300;
const FRAME_MARGIN_X = 48;

export const useLayoutStore = create<LayoutStore>()((set) => {
  return {
    state: LayoutState.CLOSED,
    frameSize: { width: DEFAULT_FRAME_WIDTH, height: DEFAULT_FRAME_HEIGHT },
    setFrameSize: (parentDimensions: WindowDimensions) => {
      const frameSize = {
        width:
          parentDimensions.width - FRAME_MARGIN_X < DEFAULT_FRAME_WIDTH
            ? parentDimensions.width - FRAME_MARGIN_X
            : DEFAULT_FRAME_WIDTH,
        height: DEFAULT_FRAME_HEIGHT,
      };
      set({ frameSize });
      parentDispatch(RESIZE_FRAME_ACTION(frameSize));
    },
    open: (dimensions: WindowDimensions) => {
      clearTimeout(timeout);
      parentDispatch(RESIZE_FRAME_ACTION(dimensions));
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
          width: 400,
          height: 50,
        }),
      );
      parentDispatch(MINIMIZE_WIDGET_ACTION);
      return set({ state: LayoutState.CLOSED });
    },
  };
});
