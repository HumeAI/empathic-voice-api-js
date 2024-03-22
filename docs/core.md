## :toolbox: Functions

- [arrayBufferToBlob](#gear-arraybuffertoblob)
- [base64ToBlob](#gear-base64toblob)
- [getSupportedMimeType](#gear-getsupportedmimetype)
- [createConfig](#gear-createconfig)
- [createSocketUrl](#gear-createsocketurl)
- [isSocketUnknownMessageError](#gear-issocketunknownmessageerror)
- [isSocketFailedToParseMessageError](#gear-issocketfailedtoparsemessageerror)
- [parseMessageData](#gear-parsemessagedata)
- [parseMessageType](#gear-parsemessagetype)
- [getAudioStream](#gear-getaudiostream)
- [checkForAudioTracks](#gear-checkforaudiotracks)
- [fetchAccessToken](#gear-fetchaccesstoken)
- [parseAudioMessage](#gear-parseaudiomessage)

### :gear: arrayBufferToBlob

| Function | Type |
| ---------- | ---------- |
| `arrayBufferToBlob` | `(arrayBuffer: ArrayBuffer, mimeType?: string or undefined) => Blob` |

### :gear: base64ToBlob

| Function | Type |
| ---------- | ---------- |
| `base64ToBlob` | `(base64: string, contentType: string) => Blob` |

### :gear: getSupportedMimeType

| Function | Type |
| ---------- | ---------- |
| `getSupportedMimeType` | `() => { success: true; mimeType: MimeType; } or { success: false; error: Error; }` |

### :gear: createConfig

| Function | Type |
| ---------- | ---------- |
| `createConfig` | `(config: Pick<{ [x: string]: any; auth?: any; hostname?: string or undefined; channels?: Channels or undefined; sampleRate?: number or undefined; tts?: TTSService or undefined; ... 5 more ...; languageModel?: any; }, "auth"> and Partial<...>) => { ...; }` |

Parameters:

* `config`: - The configuration for the client.


### :gear: createSocketUrl

| Function | Type |
| ---------- | ---------- |
| `createSocketUrl` | `(config: { [x: string]: any; auth?: any; hostname?: string or undefined; channels?: Channels or undefined; sampleRate?: number or undefined; tts?: TTSService or undefined; ... 5 more ...; languageModel?: any; }) => string` |

Parameters:

* `config`: - The configuration for the client.


### :gear: isSocketUnknownMessageError

| Function | Type |
| ---------- | ---------- |
| `isSocketUnknownMessageError` | `(err: unknown) => err is SocketUnknownMessageError` |

Parameters:

* `err`: - The error to check.


### :gear: isSocketFailedToParseMessageError

| Function | Type |
| ---------- | ---------- |
| `isSocketFailedToParseMessageError` | `(err: unknown) => err is SocketFailedToParseMessageError` |

Parameters:

* `err`: - The error to check.


### :gear: parseMessageData

| Function | Type |
| ---------- | ---------- |
| `parseMessageData` | `(data: unknown) => Promise<{ success: true; message: any; } or { success: false; error: Error; }>` |

Parameters:

* `data`: - The data to parse.


### :gear: parseMessageType

| Function | Type |
| ---------- | ---------- |
| `parseMessageType` | `(event: MessageEvent<any>) => Promise<{ success: true; message: any; } or { success: false; error: Error; }>` |

Parameters:

* `event`: - The event to parse.


### :gear: getAudioStream

| Function | Type |
| ---------- | ---------- |
| `getAudioStream` | `() => Promise<MediaStream>` |

### :gear: checkForAudioTracks

| Function | Type |
| ---------- | ---------- |
| `checkForAudioTracks` | `(stream: MediaStream) => void` |

Parameters:

* `stream`: The MediaStream to check


### :gear: fetchAccessToken

| Function | Type |
| ---------- | ---------- |
| `fetchAccessToken` | `(args: { apiKey: string; clientSecret: string; host?: string or undefined; }) => Promise<string>` |

Parameters:

* `args`: - The arguments for the request.


### :gear: parseAudioMessage

| Function | Type |
| ---------- | ---------- |
| `parseAudioMessage` | `(blob: Blob) => Promise<any>` |


## :wrench: Constants

- [AuthStrategySchema](#gear-authstrategyschema)
- [MAX_SYSTEM_PROMPT_LENGTH](#gear-max_system_prompt_length)
- [ConfigSchema](#gear-configschema)
- [defaultConfig](#gear-defaultconfig)
- [EmotionScoresSchema](#gear-emotionscoresschema)
- [TranscriptModelsSchema](#gear-transcriptmodelsschema)
- [TimeSliceSchema](#gear-timesliceschema)
- [JSONMessageSchema](#gear-jsonmessageschema)

### :gear: AuthStrategySchema

| Constant | Type |
| ---------- | ---------- |
| `AuthStrategySchema` | `any` |

### :gear: MAX_SYSTEM_PROMPT_LENGTH

| Constant | Type |
| ---------- | ---------- |
| `MAX_SYSTEM_PROMPT_LENGTH` | `100000` |

### :gear: ConfigSchema

| Constant | Type |
| ---------- | ---------- |
| `ConfigSchema` | `ZodObject<{ auth: any; hostname: ZodString; channels: ZodOptional<ZodNativeEnum<typeof Channels>>; sampleRate: ZodOptional<ZodNumber>; ... 6 more ...; languageModel: ZodOptional<...>; }, "strip", ZodTypeAny, { ...; }, { ...; }>` |

### :gear: defaultConfig

| Constant | Type |
| ---------- | ---------- |
| `defaultConfig` | `Omit<{ [x: string]: any; auth?: any; hostname?: string or undefined; channels?: Channels or undefined; sampleRate?: number or undefined; tts?: TTSService or undefined; ... 5 more ...; languageModel?: any; }, "auth">` |

### :gear: EmotionScoresSchema

| Constant | Type |
| ---------- | ---------- |
| `EmotionScoresSchema` | `any` |

### :gear: TranscriptModelsSchema

| Constant | Type |
| ---------- | ---------- |
| `TranscriptModelsSchema` | `any` |

### :gear: TimeSliceSchema

| Constant | Type |
| ---------- | ---------- |
| `TimeSliceSchema` | `ZodObject<{ begin: ZodNumber; end: ZodNumber; }, "strip", ZodTypeAny, { begin: number; end: number; }, { begin: number; end: number; }>` |

### :gear: JSONMessageSchema

| Constant | Type |
| ---------- | ---------- |
| `JSONMessageSchema` | `any` |


## :factory: SocketUnknownMessageError

## :factory: SocketFailedToParseMessageError

## :factory: VoiceClient

### Methods

- [create](#gear-create)
- [on](#gear-on)
- [connect](#gear-connect)
- [disconnect](#gear-disconnect)
- [sendAudio](#gear-sendaudio)
- [sendText](#gear-sendtext)
- [sendSystemPrompt](#gear-sendsystemprompt)

#### :gear: create

| Method | Type |
| ---------- | ---------- |
| `create` | `(config: { [x: string]: any; auth?: any; hostname?: string or undefined; channels?: Channels or undefined; sampleRate?: number or undefined; tts?: TTSService or undefined; ... 5 more ...; languageModel?: any; }) => VoiceClient` |

Parameters:

* `config`: - The configuration for the client.


#### :gear: on

| Method | Type |
| ---------- | ---------- |
| `on` | `<T extends keyof VoiceEventMap>(event: T, callback: VoiceEventMap[T]) => void` |

Parameters:

* `event`: - The event to attach to.
* `callback`: - The callback to run when the event is triggered.


#### :gear: connect

| Method | Type |
| ---------- | ---------- |
| `connect` | `() => this` |

#### :gear: disconnect

| Method | Type |
| ---------- | ---------- |
| `disconnect` | `() => void` |

#### :gear: sendAudio

| Method | Type |
| ---------- | ---------- |
| `sendAudio` | `(audioBuffer: ArrayBufferLike) => void` |

#### :gear: sendText

| Method | Type |
| ---------- | ---------- |
| `sendText` | `(text: string) => void` |

#### :gear: sendSystemPrompt

| Method | Type |
| ---------- | ---------- |
| `sendSystemPrompt` | `(text: string) => void` |


## :cocktail: Types

- [AuthStrategy](#gear-authstrategy)
- [Config](#gear-config)
- [VoiceEventMap](#gear-voiceeventmap)
- [AgentEndMessage](#gear-agentendmessage)
- [EmotionScores](#gear-emotionscores)
- [AgentTranscriptMessage](#gear-agenttranscriptmessage)
- [AudioMessage](#gear-audiomessage)
- [AudioOutputMessage](#gear-audiooutputmessage)
- [JSONErrorMessage](#gear-jsonerrormessage)
- [TimeSlice](#gear-timeslice)
- [UserInterruptionMessage](#gear-userinterruptionmessage)
- [UserTranscriptMessage](#gear-usertranscriptmessage)
- [JSONMessage](#gear-jsonmessage)

### :gear: AuthStrategy

| Type | Type |
| ---------- | ---------- |
| `AuthStrategy` | `z.infer<typeof AuthStrategySchema>` |

### :gear: Config

| Type | Type |
| ---------- | ---------- |
| `Config` | `z.infer<typeof ConfigSchema>` |

### :gear: VoiceEventMap

| Type | Type |
| ---------- | ---------- |
| `VoiceEventMap` | `{
  open?: () => void;
  message?: (message: JSONMessage or AudioMessage) => void;
  close?: () => void;
  error?: (error: Error) => void;
}` |

### :gear: AgentEndMessage

| Type | Type |
| ---------- | ---------- |
| `AgentEndMessage` | `z.infer<typeof AgentEndMessageSchema>` |

### :gear: EmotionScores

| Type | Type |
| ---------- | ---------- |
| `EmotionScores` | `z.infer<typeof EmotionScoresSchema>` |

### :gear: AgentTranscriptMessage

| Type | Type |
| ---------- | ---------- |
| `AgentTranscriptMessage` | `z.infer<
  typeof AgentTranscriptMessageSchema
>` |

### :gear: AudioMessage

| Type | Type |
| ---------- | ---------- |
| `AudioMessage` | `z.infer<typeof AudioMessageSchema>` |

### :gear: AudioOutputMessage

| Type | Type |
| ---------- | ---------- |
| `AudioOutputMessage` | `z.infer<typeof AudioOutputMessageSchema>` |

### :gear: JSONErrorMessage

| Type | Type |
| ---------- | ---------- |
| `JSONErrorMessage` | `z.infer<typeof JSONErrorMessageSchema>` |

### :gear: TimeSlice

| Type | Type |
| ---------- | ---------- |
| `TimeSlice` | `z.infer<typeof TimeSliceSchema>` |

### :gear: UserInterruptionMessage

| Type | Type |
| ---------- | ---------- |
| `UserInterruptionMessage` | `z.infer<
  typeof UserInterruptionMessageSchema
>` |

### :gear: UserTranscriptMessage

| Type | Type |
| ---------- | ---------- |
| `UserTranscriptMessage` | `z.infer<typeof UserTranscriptMessageSchema>` |

### :gear: JSONMessage

| Type | Type |
| ---------- | ---------- |
| `JSONMessage` | `z.infer<typeof JSONMessageSchema>` |

