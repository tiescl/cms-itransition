import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { useContext } from 'react';
import '../styles/bootstrp.css';

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
    <>
      <nav className='navbar navbar-light bg-light fixed-top navbar-expand-lg'>
        <div className='container-fluid'>
          <Link to='/' className='navbar-brand fw-bold fs-1 ms-4 me-2'>
            CMS
          </Link>

          <button
            className='navbar-toggler'
            type='button'
            data-bs-toggle='offcanvas'
            data-bs-target='#navbarNav'
            aria-controls='navbarNav'
            aria-expanded='false'
            aria-label='Toggle navigation'
          >
            <span className='navbar-toggler-icon'></span>
          </button>

          <div
            className='offcanvas offcanvas-end'
            tabIndex='-1'
            id='navbarNav'
            aria-labelledby='navbarNavLabel'
          >
            <div className='offcanvas-header'>
              <h5 className='offcanvas-title fs-4 ms-2'>
                <strong>{user?.username || 'Guest'}</strong>
              </h5>
              <button
                type='button'
                className='btn-close text-reset'
                data-bs-dismiss='offcanvas'
                aria-label='Close'
              ></button>
            </div>
            <div className='offcanvas-body d-flex justify-content-center shift-on-large-screen'>
              <ul className='navbar-nav align-items-center'>
                <li className='nav-item fs-5 me-2 hide-on-small-screen'>
                  <strong>{user?.username || 'Guest'}</strong>
                </li>
                {user ? (
                  <li className='nav-item m-2'>
                    <Link
                      to='/'
                      onClick={handleLogout}
                      className='btn btn-primary'
                    >
                      Log out
                    </Link>
                  </li>
                ) : (
                  <>
                    <li className='nav-item'>
                      <Link
                        to='/login'
                        className='btn btn-primary m-2'
                        style={{ width: '86px' }}
                      >
                        Log in
                      </Link>
                      <Link to='/register' className='btn btn-primary m-2'>
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
