import { Button } from '@/components/Button';
import { FC } from 'react';

type ErrorScreenProps = {
  errorReason: string;
  onConnect: () => void;
  isConnecting: boolean;
};

export const ErrorScreen: FC<ErrorScreenProps> = ({
  errorReason,
  onConnect,
  isConnecting,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center">Sorry, we had to end your session.</div>
      <div>Error: {errorReason}</div>
      <div className="pt-4">
        <Button
          onClick={onConnect}
          isLoading={isConnecting}
          loadingText={'Connecting...'}
        >
          Reconnect
        </Button>
      </div>
    </div>
  );
};
