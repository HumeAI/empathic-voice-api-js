import type { Config } from './create-config';
import { createConfig } from './create-config';
import type { ClientToFrameAction } from './embed-messages';
import {
  FrameToClientActionSchema,
  UPDATE_CONFIG_ACTION,
  WIDGET_IFRAME_IS_READY_ACTION,
} from './embed-messages';

export type EmbeddedAssistantConfig = {
  rendererUrl: string;
} & Config;

export class EmbeddedAssistant {
  private iframe: HTMLIFrameElement;

  private isMounted: boolean = false;

  private managedContainer: HTMLElement | null = null;

  private config: EmbeddedAssistantConfig;

  private constructor(config: EmbeddedAssistantConfig) {
    this.config = config;
    this.iframe = this.createIframe(config);

    this.messageHandler = this.messageHandler.bind(this);
  }

  static create({
    rendererUrl,
    ...config
  }: Partial<EmbeddedAssistantConfig> &
    NonNullable<Pick<EmbeddedAssistantConfig, 'apiKey'>>): EmbeddedAssistant {
    const parsedConfig = createConfig(config);

    return new EmbeddedAssistant({
      rendererUrl: rendererUrl ?? 'https://assistant-widget.hume.ai',
      ...parsedConfig,
    });
  }

  mount(container?: HTMLElement) {
    const messageHandler = (event: MessageEvent<unknown>) => {
      this.messageHandler(event);
    };

    const el = container ?? this.createContainer();

    try {
      window.addEventListener('message', messageHandler);
      el.appendChild(this.iframe);
      this.isMounted = true;
    } catch (e) {
      this.isMounted = false;
    }

    const unmount = () => {
      try {
        window.removeEventListener('message', messageHandler);
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
      padding: '24px',
      zIndex: '999999',
      fontSize: '0px',
    });

    div.id = 'hume-embedded-assistant-container';

    document.body.appendChild(div);

    return div;
  }

  private createIframe({ rendererUrl }: EmbeddedAssistantConfig) {
    const el = document.createElement('iframe');

    Object.assign(el.style, {
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      border: 'none',
      height: '0px',
      width: '0px',
      opacity: '0',
    });

    el.id = 'hume-embedded-assistant';

    el.src = `${rendererUrl}`;

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
        break;
      }
      case 'resize_frame': {
        this.resizeIframe(action.data.payload);
        break;
      }
    }
  }

  private sendConfigObject() {
    const action = UPDATE_CONFIG_ACTION(this.config);
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
  }

  private hideIframe() {
    this.iframe.style.opacity = '0';
  }

  private resizeIframe({ width, height }: { width: number; height: number }) {
    this.iframe.style.width = `${width}px`;
    this.iframe.style.height = `${height}px`;
  }
}
