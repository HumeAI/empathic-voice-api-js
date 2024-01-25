import { useEffect, useRef } from 'react';
import { parentDispatch } from '../../utils/parentDispatch';
import { WIDGET_IFRAME_IS_READY_ACTION } from '@humeai/assistant-react';
import { useLayoutStore } from '../../store/layout';

export const IframeReady = () => {
  const hasMounted = useRef(false);
  const close = useLayoutStore((store) => store.close);

  useEffect(() => {
    if (!hasMounted.current) {
      parentDispatch(WIDGET_IFRAME_IS_READY_ACTION);
      close();
      hasMounted.current = true;
    }
  }, [close]);

  return null;
};
