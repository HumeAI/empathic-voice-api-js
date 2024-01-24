import { parseClientToFrameAction, Config } from '@humeai/assistant-react';
import { FC, useEffect, useRef } from 'react';

export type MessageListenerProps = {
  onUpdateConfig?: (config: Config) => void;
  onCancel?: () => void;
};

export const MessageListener: FC<MessageListenerProps> = (props) => {
  const onUpdateConfig = useRef(props.onUpdateConfig);
  onUpdateConfig.current = props.onUpdateConfig;

  const onCancel = useRef(props.onCancel);
  onCancel.current = props.onCancel;

  useEffect(() => {
    const listener = async (event: MessageEvent<unknown>) => {
      const action = await parseClientToFrameAction(event.data)
        .then((res) => res)
        .catch(() => new Error());

      if (action instanceof Error) {
        return;
      }

      switch (action.type) {
        case 'update_config': {
          onUpdateConfig.current?.(action.payload);
          break;
        }
        case 'cancel': {
          onCancel.current?.();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  return null;
};
