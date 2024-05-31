export default function IncompleteRoute(props) {
  return (
    <>
      <h1
        style={{ fontSize: '40px', marginTop: '40vh' }}
        className='mx-auto text-center fw-semibold'
      >
        {props.text}
      </h1>
      <div style={{ fontSize: '40px', textAlign: 'center' }}>
        Will be fixed very very soon
      </div>
    </>
  );
}
