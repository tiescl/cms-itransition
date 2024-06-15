import { Link } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import ThemeContext from '../../context/ThemeContext';
import { useContext, useState, useEffect } from 'react';

import '../../styles/bootstrp.css';

export default function Navbar() {
  const { user, setUser, setTrigger } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    setUser(null);
    setTrigger((prev) => !prev);
    localStorage.removeItem('auth');
    localStorage.removeItem('tokenExpiration');
    console.log('logged out');
  };

  return (
    <>
      <nav
        className={`navbar navbar-light bg-${
          theme === 'light' ? 'light' : 'dark'
        } border-bottom border-2 fixed-top navbar-expand-lg`}
      >
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
                <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
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
                <li
                  className='nav-link fs-5 text-center'
                  id='hide-on-small-screen'
                >
                  <strong>
                    <Link
                      to={`/users/${user?._id || ''}`}
                      className={`text-decoration-none text-${
                        theme === 'light' ? 'dark' : 'light'
                      } `}
                    >
                      {user?.username || 'Guest'}
                    </Link>
                    <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
                  </strong>
                </li>
                <form className='d-flex my-4 me-2' role='search'>
                  <div className='input-group'>
                    <input
                      className='form-control'
                      type='search'
                      placeholder='Search'
                      style={{ maxWidth: '180px' }}
                    />
                    <button className='btn btn-primary' type='submit'>
                      <i className='bi bi-search'></i>
                    </button>
                  </div>
                </form>

                <Actions user={user} theme={theme} />

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

function Actions({ theme, user }) {
  return (
    <>
      <div className='btn-group m-2'>
        {user?.isAdmin && (
          <Link
            to='/users'
            className={`btn btn-outline-${
              theme === 'light' ? 'secondary' : 'info'
            }`}
          >
            <i className='bi bi-award'></i>
          </Link>
        )}
        <Link
          to='/collections'
          className={`btn btn-outline-${
            theme === 'light' ? 'primary' : 'info'
          }`}
        >
          <i className='bi bi-list-ol'></i> Collections
        </Link>
        <Link
          to='/collections/create'
          className={`btn btn-outline-${
            theme === 'light' ? 'primary' : 'info'
          }`}
        >
          <i className='bi bi-plus-circle'></i> Create
        </Link>
      </div>
    </>
  );
}

function ThemeSwitch({ theme, toggleTheme }) {
  return (
    <button
      className='btn btn-link fs-5'
      onClick={toggleTheme}
      id='themeSwitch'
    >
      <i
        className={`bi ${theme === 'light' ? 'bi-sun' : 'bi-sun-fill'}`}
        id='themeIcon'
      ></i>
    </button>
  );
}
