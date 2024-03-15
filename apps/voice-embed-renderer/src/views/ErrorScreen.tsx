import { FC } from 'react';

type ErrorScreenProps = {
  errorReason: string;
  onConnect: () => void;
};

export const ErrorScreen: FC<ErrorScreenProps> = ({
  errorReason,
  onConnect,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center">Sorry, we had to end your session.</div>
      <div>Error: {errorReason}</div>
      <div className="pt-4">
        <button
          className={
            'flex h-[36px] items-center justify-center rounded-full border border-gray-700 bg-gray-800 px-4 text-base font-medium text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none'
          }
          onClick={onConnect}
        >
          Reconnect
        </button>
      </div>
    </div>
  );
};
