import { useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import ThemeContext from '../context/ThemeContext';

import {
  Actions,
  ProfileDropdown,
  NavbarSearch
} from '../components/layout/NavbarComponents';

import '../styles/bootstrp.css';

export default function Navbar() {
  var { user } = useContext(UserContext);
  var { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <nav
        className={`navbar navbar-light bg-${theme} border-bottom border-2 fixed-top navbar-expand-lg`}
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
            tabIndex={-1}
            id='navbarNav'
            data-bs-scroll='true'
            aria-labelledby='navbarNavLabel'
          >
            <div className='offcanvas-header'>
              <div className='offcanvas-title'>
                <div className='d-block d-lg-none'>
                  <ProfileDropdown
                    theme={theme}
                    toggleTheme={toggleTheme}
                  />
                </div>
              </div>
              <button
                type='button'
                className='btn-close text-reset'
                data-bs-dismiss='offcanvas'
                aria-label='Close'
              ></button>
            </div>
            <div className='offcanvas-body shift-on-large-screen'>
              <ul className='navbar-nav align-items-center'>
                <NavbarSearch />

                <Actions user={user} theme={theme} />

                <div className='d-none d-lg-block'>
                  <ProfileDropdown
                    theme={theme}
                    toggleTheme={toggleTheme}
                  />
                </div>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
