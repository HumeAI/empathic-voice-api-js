import { FC, PropsWithChildren, useEffect, useState } from 'react';

export type IframeGuardProps = PropsWithChildren<{
  fallback: () => JSX.Element | null;
}>;

export const IframeGuard: FC<IframeGuardProps> = ({
  fallback: Fallback,
  children,
}) => {
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    if (window.self !== window.top) {
      setIsIframe(true);
    }
  }, []);

  if (isIframe) {
    return <>{children}</>;
  }

  return <Fallback />;
};
