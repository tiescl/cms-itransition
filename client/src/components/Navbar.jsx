import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { useContext } from 'react';
import '../styles/bootstrp.css';
import searchImage from '../data/image-search.svg';

export default function Navbar() {
  const { user, setUser, setTrigger } = useContext(UserContext);

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
            data-bs-scroll='true'
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
            <div className='offcanvas-body shift-on-large-screen'>
              <ul className='navbar-nav align-items-center'>
                <li className='nav-item fs-5 me-2 hide-on-small-screen'>
                  <strong>
                    <Link
                      to={`/users/${user?._id || ''}`}
                      className='text-decoration-none text-black'
                    >
                      {user?.username || 'Guest'}
                    </Link>
                  </strong>
                </li>
                <form className='d-flex mb-4 mt-4 me-2 ' role='search'>
                  <div className='input-group'>
                    <input
                      className='form-control'
                      type='search'
                      placeholder='Search'
                    />
                    <button className='btn btn-primary' type='submit'>
                      <img src={searchImage} alt='search icon' />
                    </button>
                  </div>
                </form>

                <Actions user={user} />

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

function Actions({ user }) {
  return (
    <>
      <div className='btn-group mx-2'>
        {user?.isAdmin && (
          <Link
            to='/users'
            className='btn btn-outline-secondary'
            data-bs-toggle='tooltip'
            title='Users'
          >
            <i className='bi bi-award'></i>
          </Link>
        )}
        <Link to='/collections' className='btn btn-outline-primary'>
          <i className='bi bi-list-ol'></i> Collections
        </Link>
        <Link to='/collections/create' className='btn btn-outline-primary'>
          <i className='bi bi-plus-circle'></i> Create
        </Link>
      </div>
    </>
  );
}
