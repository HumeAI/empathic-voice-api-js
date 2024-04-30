'use client';
import type { ToolCall, ToolError, ToolResponse } from '@humeai/voice-react';
import { VoiceProvider } from '@humeai/voice-react';

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
            const args = JSON.parse(toolCall.parameters) as {
              location: string;
              format: 'fahrenheit' | 'celsius';
            };

            const location = await fetch(
              `https://geocode.maps.co/search?q=${args.location}&api_key=663042e9e06db354370369bhzc3ca91`,
            );

            const locationResults = (await location.json()) as {
              lat: number;
              lon: number;
            }[];

            const { lat, lon } = locationResults[0];

            const pointMetadataEndpoint: string = `https://api.weather.gov/points/${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;

            const result = await fetch(pointMetadataEndpoint, {
              method: 'GET',
            });

            const json = (await result.json()) as {
              properties: {
                forecast: string;
              };
            };
            const { properties } = json;
            const { forecast: forecastUrl } = properties;

            const forecastResult = await fetch(forecastUrl);

            const forecastJson = (await forecastResult.json()) as {
              properties: {
                periods: unknown[];
              };
            };
            const forecast = forecastJson.properties.periods;

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
