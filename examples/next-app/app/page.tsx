import { ExampleComponent } from '@/components/ExampleComponent';

export default function Home() {
  const apiKey = process.env['NEXT_PUBLIC_HUME_API_KEY'];

  return (
    <div className={'p-6'}>
      <h1 className={'font-medium'}>Hume Assistant Example Component</h1>

      {apiKey ? (
        <ExampleComponent apiKey={apiKey} />
      ) : (
        <div>Missing API Key</div>
      )}
    </div>
  );
}
