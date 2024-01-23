import { useEffect, useRef } from 'react';
import { parentDispatch } from '../../utils/parentDispatch';
import { WIDGET_IFRAME_IS_READY_ACTION } from '@humeai/assistant-react';

export const IframeReady = () => {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      parentDispatch(WIDGET_IFRAME_IS_READY_ACTION);
      hasMounted.current = true;
    }
  }, []);

  return null;
};
