import Navbar from './components/Navbar.jsx';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from './context/UserContext.jsx';

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
  const { user } = useContext(UserContext);

  return (
    <div
      className='d-flex justify-content-center'
      style={{ marginTop: '150px' }}
    ></div>
  );
}

export default App;
