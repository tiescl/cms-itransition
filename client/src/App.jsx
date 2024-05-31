import Navbar from './components/Navbar.jsx';
import IncompleteRoute from './components/IncompleteRoute.jsx';
import { Link } from 'react-router-dom';

function App() {
  return (
    <>
      <Navbar />
      <div
        className='d-flex justify-content-start'
        style={{ marginTop: '150px' }}
      >
        <Link to='/users' className='btn btn-primary mx-4'>
          Users Panel
        </Link>
        <Link to='/collections/create' className='btn btn-primary'>
          Create Collection
        </Link>
      </div>
      <div
        style={{ textAlign: 'center', marginTop: '100px', fontSize: '40px' }}
      >
        Hello world!
        <IncompleteRoute text='Landing page' />
      </div>
    </>
  );
}

export default App;
