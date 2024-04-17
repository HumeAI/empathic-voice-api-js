import type {
  AssistantTranscriptMessage,
  SocketConfig,
  UserTranscriptMessage,
} from '@humeai/voice';
import { createSocketConfig } from '@humeai/voice';

import type { ClientToFrameAction } from './embed-messages';
import {
  EXPAND_FROM_CLIENT_ACTION,
  FrameToClientActionSchema,
  SEND_WINDOW_SIZE_ACTION,
  UPDATE_CONFIG_ACTION,
  WIDGET_IFRAME_IS_READY_ACTION,
} from './embed-messages';

export type EmbeddedVoiceConfig = {
  rendererUrl: string;
  iframeTitle?: string;
} & SocketConfig;

export type TranscriptMessageHandler = (
  message: UserTranscriptMessage | AssistantTranscriptMessage,
) => void;

export type CloseHandler = () => void;

export class EmbeddedVoice {
  private iframe: HTMLIFrameElement;

  private isMounted: boolean = false;

  private managedContainer: HTMLElement | null = null;

  private config: EmbeddedVoiceConfig;

  private onMessage: TranscriptMessageHandler;

  private onClose: CloseHandler;

  private openOnMount: boolean;

  private constructor({
    onMessage = () => {},
    onClose = () => {},
    openOnMount,
    ...config
  }: {
    onMessage?: TranscriptMessageHandler;
    onClose?: CloseHandler;
    openOnMount?: boolean;
  } & EmbeddedVoiceConfig) {
    this.config = config;
    this.iframe = this.createIframe(config);
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.openOnMount = openOnMount ?? false;
    this.messageHandler = this.messageHandler.bind(this);
    this.messageHandler = this.messageHandler.bind(this);
  }

  static create({
    rendererUrl,
    onMessage,
    onClose,
    openOnMount,
    ...config
  }: Partial<EmbeddedVoiceConfig> & {
    onMessage?: TranscriptMessageHandler;
    onClose?: CloseHandler;
    openOnMount?: boolean;
  } & NonNullable<Pick<EmbeddedVoiceConfig, 'auth'>>): EmbeddedVoice {
    const parsedConfig = createSocketConfig(config);

    return new EmbeddedVoice({
      rendererUrl: rendererUrl ?? 'https://voice-widget.hume.ai',
      onMessage,
      onClose,
      openOnMount,
      ...parsedConfig,
    });
  }

  mount(container?: HTMLElement) {
    const messageHandler = (event: MessageEvent<unknown>) => {
      this.messageHandler(event);
    };

    const resizeHandler = () => {
      this.sendWindowSize();
    };

    const el = container ?? this.createContainer();

    this.managedContainer = el;

    try {
      window.addEventListener('message', messageHandler);
      window.addEventListener('resize', resizeHandler);
      el.appendChild(this.iframe);
      this.isMounted = true;
    } catch (e) {
      this.isMounted = false;
    }

    const unmount = () => {
      try {
        window.removeEventListener('message', messageHandler);
        window.removeEventListener('resize', resizeHandler);
        this.iframe.remove();
        this.isMounted = false;
      } catch (e) {
        this.isMounted = true;
      }

      if (!container) {
        el.remove();
      }
    };

    return unmount;
  }

  private createContainer() {
    const div = document.createElement('div');

    Object.assign(div.style, {
      background: 'transparent',
      position: 'fixed',
      bottom: '0',
      right: '0',
      margin: '24px',
      zIndex: '999999',
      fontSize: '0px',
      pointerEvents: 'none',
    });

    div.id = 'hume-embedded-voice-container';

    document.body.appendChild(div);

    return div;
  }

  private createIframe({ rendererUrl, iframeTitle }: EmbeddedVoiceConfig) {
    const el = document.createElement('iframe');

    Object.assign(el.style, {
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      border: 'none',
      height: '0px',
      width: '0px',
      opacity: '0',
    });

    el.id = 'hume-embedded-voice';
    el.src = `${rendererUrl}`;

    el.setAttribute('title', iframeTitle ?? 'Hume Empathic Voice Widget');
    el.setAttribute('frameborder', '0');
    el.setAttribute('allowtransparency', 'true');
    el.setAttribute('scrolling', 'no');
    el.setAttribute('allow', 'microphone');

    if (el.contentWindow) {
      el.contentWindow.document.documentElement.style.backgroundColor =
        'transparent';
      el.contentWindow.document.body.style.backgroundColor = 'transparent';
    }

    return el;
  }

  private messageHandler(event: MessageEvent<unknown>) {
    if (!this.iframe) {
      return;
    }

    if (event.origin !== new URL(this.iframe.src).origin) {
      return;
    }

    const action = FrameToClientActionSchema.safeParse(event.data);

    if (!action.success) {
      return;
    }

    switch (action.data.type) {
      case WIDGET_IFRAME_IS_READY_ACTION.type: {
        this.showIframe();
        this.sendConfigObject();
        this.sendWindowSize();
        if (this.openOnMount) {
          this.openEmbed();
        }
        break;
      }
      case 'resize_frame': {
        this.resizeIframe(action.data.payload);
        break;
      }
      case 'transcript_message': {
        this.onMessage(action.data.payload);
        break;
      }
      case 'collapse_widget': {
        this.onClose();
        break;
      }
    }
  }

  openEmbed() {
    const action = EXPAND_FROM_CLIENT_ACTION({
      width: window.screen.availWidth,
      height: window.screen.availHeight,
    });
    this.sendMessageToFrame(action);
  }

  private sendConfigObject() {
    const action = UPDATE_CONFIG_ACTION(this.config);
    this.sendMessageToFrame(action);
  }

  private sendWindowSize() {
    const action = SEND_WINDOW_SIZE_ACTION({
      width: window.screen.availWidth,
      height: window.screen.availHeight,
    });
    this.sendMessageToFrame(action);
  }

  private sendMessageToFrame(action: ClientToFrameAction) {
    const frame = this.iframe;

    if (!frame.contentWindow) {
      return;
    }

    frame.contentWindow.postMessage(action, new URL(frame.src).origin);
  }

  private showIframe() {
    this.iframe.style.opacity = '1';
    if (this.managedContainer) {
      this.managedContainer.style.pointerEvents = 'all';
    }
  }

  private hideIframe() {
    this.iframe.style.opacity = '0';
    if (this.managedContainer) {
      this.managedContainer.style.pointerEvents = 'none';
    }
  }

  private resizeIframe({ width, height }: { width: number; height: number }) {
    this.iframe.style.width = `${width}px`;
    this.iframe.style.height = `${height}px`;
  }
}
