import Navbar from './components/Navbar.jsx';
import IncompleteRoute from './components/IncompleteRoute.jsx';
import { Link } from 'react-router-dom';

function App() {
  return (
    <>
      <Navbar />

      <Navigation />
      <div
        style={{ textAlign: 'center', marginTop: '100px', fontSize: '40px' }}
      >
        Hello world!
      </div>
    </>
  );
}

function Navigation() {
  return (
    <div
      className='d-flex justify-content-center'
      style={{ marginTop: '150px' }}
    >
      <Link to='/users' className='btn btn-primary mx-3'>
        Users Panel
      </Link>
      <Link to='/collections/create' className='btn btn-primary mx-3'>
        Create Collection
      </Link>
      <Link to='/collections' className='btn btn-primary mx-3'>
        Collections
      </Link>
    </div>
  );
}

export default App;
