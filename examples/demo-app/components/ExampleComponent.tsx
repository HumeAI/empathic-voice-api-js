'use client';

import { useAssistant } from '@humeai/assistant-react';

export const ExampleComponent = () => {
  const { version } = useAssistant();

  return <div className={'font-light'}>Assistant Version: {version}</div>;
};
