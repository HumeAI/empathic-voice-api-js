"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageModelOption = exports.parseClientToFrameAction = exports.WIDGET_IFRAME_IS_READY_ACTION = exports.TRANSCRIPT_MESSAGE_ACTION = exports.RESIZE_FRAME_ACTION = exports.MINIMIZE_WIDGET_ACTION = exports.EXPAND_WIDGET_ACTION = exports.COLLAPSE_WIDGET_ACTION = void 0;
__exportStar(require("./lib/EmbeddedVoice"), exports);
var voice_embed_1 = require("@humeai/voice-embed");
Object.defineProperty(exports, "COLLAPSE_WIDGET_ACTION", { enumerable: true, get: function () { return voice_embed_1.COLLAPSE_WIDGET_ACTION; } });
Object.defineProperty(exports, "EXPAND_WIDGET_ACTION", { enumerable: true, get: function () { return voice_embed_1.EXPAND_WIDGET_ACTION; } });
Object.defineProperty(exports, "MINIMIZE_WIDGET_ACTION", { enumerable: true, get: function () { return voice_embed_1.MINIMIZE_WIDGET_ACTION; } });
Object.defineProperty(exports, "RESIZE_FRAME_ACTION", { enumerable: true, get: function () { return voice_embed_1.RESIZE_FRAME_ACTION; } });
Object.defineProperty(exports, "TRANSCRIPT_MESSAGE_ACTION", { enumerable: true, get: function () { return voice_embed_1.TRANSCRIPT_MESSAGE_ACTION; } });
Object.defineProperty(exports, "WIDGET_IFRAME_IS_READY_ACTION", { enumerable: true, get: function () { return voice_embed_1.WIDGET_IFRAME_IS_READY_ACTION; } });
Object.defineProperty(exports, "parseClientToFrameAction", { enumerable: true, get: function () { return voice_embed_1.parseClientToFrameAction; } });
Object.defineProperty(exports, "LanguageModelOption", { enumerable: true, get: function () { return voice_embed_1.LanguageModelOption; } });
