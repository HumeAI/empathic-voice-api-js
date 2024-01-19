import { useEffect, useRef } from 'react';
import { parentDispatch } from '../../utils/parentDispatch';

export const IframeReady = () => {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      parentDispatch({
        action: 'iframe_ready',
      });
      hasMounted.current = true;
    }
  }, []);

  return null;
};
