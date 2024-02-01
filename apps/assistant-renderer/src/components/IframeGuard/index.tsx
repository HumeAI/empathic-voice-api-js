import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useLayoutStore } from '../../store/layout';
import { parentDispatch } from '../../utils/parentDispatch';
import { WIDGET_IFRAME_IS_READY_ACTION } from '@humeai/assistant-react';

export type IframeGuardProps = PropsWithChildren<{
  fallback: () => JSX.Element | null;
}>;

export const IframeGuard: FC<IframeGuardProps> = ({
  fallback: Fallback,
  children,
}) => {
  const [isIframe, setIsIframe] = useState(false);
  const close = useLayoutStore((store) => store.close);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (window.self !== window.top) {
      setIsIframe(true);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      parentDispatch(WIDGET_IFRAME_IS_READY_ACTION);
      close();
      hasMounted.current = true;
    }
  }, [close]);

  if (isIframe) {
    return <>{children}</>;
  }

  return <Fallback />;
};
