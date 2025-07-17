"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddedVoice = void 0;
const voice_embed_1 = require("@humeai/voice-embed");
const react_1 = require("react");
const EmbeddedVoice = (props) => {
    const { onMessage, isEmbedOpen, onClose, openOnMount = false, ...config } = props;
    const embeddedVoice = (0, react_1.useRef)(null);
    const onMessageHandler = (0, react_1.useRef)();
    onMessageHandler.current = onMessage;
    const onCloseHandler = (0, react_1.useRef)();
    onCloseHandler.current = onClose;
    const stableConfig = (0, react_1.useRef)();
    stableConfig.current = config;
    (0, react_1.useEffect)(() => {
        let unmount;
        if (!embeddedVoice.current && stableConfig.current) {
            embeddedVoice.current = voice_embed_1.EmbeddedVoice.create({
                onMessage: onMessageHandler.current,
                onClose: onCloseHandler.current,
                openOnMount: openOnMount,
                ...stableConfig.current,
            });
            unmount = embeddedVoice.current.mount();
        }
        return () => {
            unmount?.();
            embeddedVoice.current = null;
        };
    }, [openOnMount]);
    (0, react_1.useEffect)(() => {
        if (isEmbedOpen) {
            embeddedVoice.current?.openEmbed();
        }
    }, [isEmbedOpen]);
    return null;
};
exports.EmbeddedVoice = EmbeddedVoice;
