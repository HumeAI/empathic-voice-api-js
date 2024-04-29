'use client';
import {
  ToolCall,
  ToolError,
  ToolResponse,
  VoiceProvider,
} from '@humeai/voice-react';

import { ExampleComponent } from '@/components/ExampleComponent';

export const Voice = ({ accessToken }: { accessToken: string }) => {
  return (
    <VoiceProvider
      auth={{ type: 'accessToken', value: accessToken }}
      hostname={process.env.NEXT_PUBLIC_HUME_VOICE_HOSTNAME || 'api.hume.ai'}
      messageHistoryLimit={10}
      onMessage={(message) => {
        // eslint-disable-next-line no-console
        console.log('message', message);
      }}
      onToolCall={async (
        toolCall: ToolCall,
      ): Promise<ToolError | ToolResponse> => {
        // eslint-disable-next-line no-console
        console.log('toolCall', toolCall);

        if (toolCall.name === 'weather_tool') {
          try {
            const result = await fetch(
              'https://httpbin.org/status/400',
              // 'https://api.weather.gov/gridpoints/TOP/31,80/forecast',
              {
                method: 'GET',
              },
            );
            const json = await result.json();
            const forecast = json.properties.periods;

            return {
              type: 'tool_response',
              tool_call_id: toolCall.tool_call_id,
              content: JSON.stringify(forecast),
            };
          } catch (error) {
            return {
              type: 'tool_error',
              tool_call_id: toolCall.tool_call_id,
              error: 'Weather tool error',
              code: 'weather_tool_error',
              level: 'error',
              content: 'There was an error with the weather tool',
            };
          }
        } else {
          return {
            type: 'tool_error',
            tool_call_id: toolCall.tool_call_id,
            error: 'Tool not found',
            code: 'tool_not_found',
            level: 'warning',
            content: 'The tool you requested was not found',
          };
        }
      }}
      configId="d9fa1297-7e9d-4b9f-87c3-f748b0b8ce5e"
      onClose={(event) => {
        const niceClosure = 1000;
        const code = event.code;

        if (code !== niceClosure) {
          // eslint-disable-next-line no-console
          console.error('close event was not nice', event);
        }
      }}
    >
      <ExampleComponent />
    </VoiceProvider>
  );
};
