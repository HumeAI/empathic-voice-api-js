export const IframeFallback = () => {
  return (
    <div className={'fixed inset-0 grid place-content-center'}>
      <div className={'text-center'}>
        <p className={'text-2xl font-bold'}>
          This app can only be used in an iframe.
        </p>
      </div>
    </div>
  );
};
