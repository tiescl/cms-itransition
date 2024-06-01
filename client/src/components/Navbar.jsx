import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { useContext } from 'react';

export default function Navbar() {
  const { user, setUser, setTrigger } = useContext(UserContext);

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';
  const token = localStorage.getItem('auth');

  const handleLogout = () => {
    setUser(null);
    setTrigger((prev) => !prev);
    localStorage.removeItem('auth');
    localStorage.removeItem('tokenExpiration');
    console.log('logged out');
  };

  return (
    <nav
      style={{ height: '80px', paddingRight: '30px' }}
      className='navbar navbar-light navbar-expand flex-nowrap justify-content-between bg-light fixed-top'
    >
      <div className='d-flex'>
        <Link to='/' className='fw-bold fs-1 mx-5'>
          CMS
        </Link>
      </div>
      <ul className='navbar-nav align-items-center'>
        <li className='nav-item fs-5 me-3'>
          Hello, <strong>{user?.username || 'Guest'}</strong>
        </li>
        {user ? (
          <li className='nav-item m-2'>
            <Link
              to='/login'
              onClick={handleLogout}
              className='btn btn-primary'
            >
              Log out
            </Link>
          </li>
        ) : (
          <>
            <li className='nav-item'>
              {/* consider not redirecting */}
              <Link to='/login' className='btn btn-primary m-2'>
                Log in
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='/register' className='btn btn-primary m-2'>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
