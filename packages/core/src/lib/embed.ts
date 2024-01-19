import { z } from 'zod';

export const PostMessageSchema = z.union([
  z.object({
    action: z.literal('expand'),
  }),
  z.object({
    action: z.literal('collapse'),
  }),
  z.object({
    action: z.literal('iframe_ready'),
  }),
]);

export type PostMessageAction = z.infer<typeof PostMessageSchema>;

export type EmbeddedAssistantConfig = {
  rendererUrl: string;
  apiHostname: string;
};

export class EmbeddedAssistant {
  iframe: HTMLIFrameElement;

  isMounted: boolean = false;

  managedContainer: HTMLElement | null = null;

  private constructor({ rendererUrl, apiHostname }: EmbeddedAssistantConfig) {
    this.iframe = this.createIframe({ rendererUrl, apiHostname });

    this.messageHandler = this.messageHandler.bind(this);
  }

  static create({
    rendererUrl,
    apiHostname,
  }: Partial<EmbeddedAssistantConfig> = {}): EmbeddedAssistant {
    return new EmbeddedAssistant({
      rendererUrl: rendererUrl ?? '/',
      apiHostname: apiHostname ?? 'https://api.hume.ai',
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

    return () => {
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

  private createIframe({ rendererUrl, apiHostname }: EmbeddedAssistantConfig) {
    const el = document.createElement('iframe');

    Object.assign(el.style, {
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      border: 'none',
      height: '52px',
      width: '348px',
      opacity: '0',
    });

    el.id = 'hume-embedded-assistant';

    el.src = `${rendererUrl}/?apiHostname=${apiHostname}`;

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

    const message = PostMessageSchema.safeParse(event.data);

    if (!message.success) {
      return;
    }

    if (message.data.action === 'iframe_ready') {
      this.iframe.style.opacity = '1';
    }
  }
}
