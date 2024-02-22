/**                                                                      
                                                                         
            client                                      frame            
                                                                         
 ┌───────────────────────────┐                                           
 │       mount iframe        │ ───────────▶                              
 └───────────────────────────┘                                           
                                            ┌───────────────────────────┐
                               ◀─────────── │      iframe is ready      │
                                            └───────────────────────────┘
 ┌───────────────────────────┐                                           
 │        send config        │ ───────────▶                              
 └───────────────────────────┘                                           
                                            ┌───────────────────────────┐
                               ◀─────────── │      widget is open       │
                                            └───────────────────────────┘
                                            ┌───────────────────────────┐
                               ◀─────────── │    widget is collapsed    │
                                            └───────────────────────────┘
                                            ┌───────────────────────────┐
                               ◀─────────── │    widget is minimized    │
                                            └───────────────────────────┘
                                            ┌───────────────────────────┐
                               ◀─────────── │    transcript message     │
                                            └───────────────────────────┘
                                            ┌───────────────────────────┐
                               ◀─────────── │       resize window       │
                                            └───────────────────────────┘
 ┌───────────────────────────┐                                           
 │      unmount iframe       │ ───────────▶                              
 └───────────────────────────┘                                           
                                                                       */
import { z } from 'zod';

import type { Config } from './create-config';
import { ConfigSchema } from './create-config';
import { type JSONMessage, JSONMessageSchema } from '../models/json-message';

// ---------------------------------------------------------------------------
// Client to frame actions
// ---------------------------------------------------------------------------
export const ClientToFrameActionSchema = z.union([
  z.object({
    type: z.literal('update_config'),
    payload: ConfigSchema,
  }),
  z.object({
    type: z.literal('cancel'),
  }),
]);

export type ClientToFrameAction = z.infer<typeof ClientToFrameActionSchema>;

export const UPDATE_CONFIG_ACTION = (config: Config) =>
  ({
    type: 'update_config',
    payload: config,
  }) satisfies ClientToFrameAction;

export const parseClientToFrameAction = (
  data: unknown,
): Promise<ClientToFrameAction> => {
  return new Promise((resolve, reject) => {
    try {
      const value = ClientToFrameActionSchema.parse(data);
      resolve(value);
    } catch (error) {
      reject(error);
    }
  });
};

// ---------------------------------------------------------------------------
// Frame to client actions
// ---------------------------------------------------------------------------
export const FrameToClientActionSchema = z.union([
  z.object({
    type: z.literal('expand_widget'),
  }),
  z.object({
    type: z.literal('collapse_widget'),
  }),
  z.object({
    type: z.literal('minimize_widget'),
  }),
  z.object({
    type: z.literal('widget_iframe_is_ready'),
  }),
  z.object({
    type: z.literal('transcript_message'),
    payload: JSONMessageSchema,
  }),
  z.object({
    type: z.literal('resize_frame'),
    payload: z.object({
      width: z.number(),
      height: z.number(),
    }),
  }),
]);

export type FrameToClientAction = z.infer<typeof FrameToClientActionSchema>;

export const EXPAND_WIDGET_ACTION = {
  type: 'expand_widget',
} satisfies FrameToClientAction;

export const COLLAPSE_WIDGET_ACTION = {
  type: 'collapse_widget' as const,
} satisfies FrameToClientAction;

export const MINIMIZE_WIDGET_ACTION = {
  type: 'minimize_widget',
} satisfies FrameToClientAction;

export const WIDGET_IFRAME_IS_READY_ACTION = {
  type: 'widget_iframe_is_ready',
} satisfies FrameToClientAction;

export const TRANSCRIPT_MESSAGE_ACTION = (message: JSONMessage) => {
  return {
    type: 'transcript_message',
    payload: message,
  } satisfies FrameToClientAction;
};

export const RESIZE_FRAME_ACTION = (dimensions: {
  width: number;
  height: number;
}) => {
  return {
    type: 'resize_frame',
    payload: {
      width: dimensions.width,
      height: dimensions.height,
    },
  } satisfies FrameToClientAction;
};
