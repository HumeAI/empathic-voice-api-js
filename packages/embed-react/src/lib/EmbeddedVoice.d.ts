import { type CloseHandler, type EmbeddedVoiceConfig, type TranscriptMessageHandler } from '@humeai/voice-embed';
type EmbeddedVoiceProps = Partial<EmbeddedVoiceConfig> & NonNullable<Pick<EmbeddedVoiceConfig, 'auth'>> & {
    onMessage?: TranscriptMessageHandler;
    onClose?: CloseHandler;
    isEmbedOpen: boolean;
    openOnMount?: boolean;
};
export declare const EmbeddedVoice: (props: EmbeddedVoiceProps) => null;
export {};
//# sourceMappingURL=EmbeddedVoice.d.ts.map