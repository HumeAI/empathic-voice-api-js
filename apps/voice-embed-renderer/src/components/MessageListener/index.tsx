import { parseClientToFrameAction, Config } from '@humeai/voice-embed-react';
import { FC, useEffect, useRef } from 'react';

export type MessageListenerProps = {
  onUpdateConfig?: (config: Config) => void;
  onCancel?: () => void;
  onOpen?: () => void;
};

export const MessageListener: FC<MessageListenerProps> = (props) => {
  const onUpdateConfig = useRef(props.onUpdateConfig);
  onUpdateConfig.current = props.onUpdateConfig;

  const onCancel = useRef(props.onCancel);
  onCancel.current = props.onCancel;

  const onOpen = useRef(props.onOpen);
  onOpen.current = props.onOpen;

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
        case 'expand_widget_from_client': {
          onOpen.current?.();
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
