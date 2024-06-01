export default function LoadingScreen() {
  return (
    <div
      className='position-fixed w-100 h-100 d-flex flex-column text-black justify-content-center align-items-center'
      style={{ top: '0', left: '0', opacity: 0.5 }}
    >
      <div
        className='spinner-border flex-row'
        role='status'
      >
        <span className='visually-hidden'>Loading...</span>
      </div>
      <h1
        className='flex-row mt-3 text-xl'
      >
        Taking too long? Try reloading the page
      </h1>
    </div>
  );
}
