export default function ErrorPage() {
  return (
    <>
      <h1
        style={{ fontSize: '50px', marginTop: '40vh', color: 'red' }}
        className='mx-auto text-center fw-semibold'
      >
        404 Page Not Found
      </h1>
      <div style={{ fontSize: '50px', textAlign: 'center' }}>
        Oops! Something went wrong
      </div>
    </>
  );
}
