import { Link } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import ThemeContext from '../../context/ThemeContext';
import { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import '../../styles/bootstrp.css';

export default function Navbar() {
  const { user } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t } = useTranslation();

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
            tabIndex='-1'
            id='navbarNav'
            data-bs-scroll='true'
            aria-labelledby='navbarNavLabel'
          >
            <div className='offcanvas-header'>
              <div className='offcanvas-title'>
                <div className='d-block d-lg-none'>
                  <ProfileDropdown theme={theme} toggleTheme={toggleTheme} />
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
                <form className='d-flex my-4 me-2' role='search'>
                  <div className='input-group'>
                    <input
                      className='form-control'
                      type='search'
                      placeholder={t('nav.search')}
                    />
                    <button className='btn btn-primary' type='submit'>
                      <i className='bi bi-search'></i>
                    </button>
                  </div>
                </form>

                <Actions user={user} theme={theme} />

                <div className='d-none d-lg-block'>
                  <ProfileDropdown theme={theme} toggleTheme={toggleTheme} />
                </div>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function Actions({ theme, user }) {
  const { t } = useTranslation();

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
          <i className='bi bi-list-ul'></i> {t('nav.collections')}
        </Link>
        <Link
          to='/collections/create'
          className={`btn btn-outline-${
            theme === 'light' ? 'primary' : 'info'
          }`}
        >
          <i className='bi bi-plus-circle'></i> {t('nav.create')}
        </Link>
      </div>
    </>
  );
}

function ThemeSwitch({ theme, toggleTheme }) {
  return (
    <div className='form-check form-switch'>
      <input
        className='form-check-input'
        type='checkbox'
        role='switch'
        id='themeSwitch'
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
      <label className='form-check-label' htmlFor='themeSwitch'></label>
    </div>
  );
}

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('lang') || 'en'
  );

  useEffect(() => {
    localStorage.setItem('lang', selectedLanguage);
  }, [selectedLanguage]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setSelectedLanguage(lng);
  };

  return (
    <div className='btn-group'>
      <button
        className={`btn btn-sm py-1 ${
          selectedLanguage === 'en' ? 'btn-primary' : 'btn-outline-primary'
        }`}
        style={{ fontSize: '0.8em' }}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button
        className={`btn btn-sm py-1 ${
          selectedLanguage === 'de' ? 'btn-primary' : 'btn-outline-primary'
        }`}
        style={{ fontSize: '0.8em' }}
        onClick={() => changeLanguage('de')}
      >
        DE
      </button>
    </div>
  );
}

function ProfileDropdown({ theme, toggleTheme }) {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, setTrigger } = useContext(UserContext);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setUser(null);
    setTrigger((prev) => !prev);
    localStorage.removeItem('auth');
    localStorage.removeItem('tokenExpiration');
    console.log('logged out');
  };

  return (
    <div className='dropdown m-3'>
      <button
        className='btn btn-primary rounded-circle border border-2 p-0'
        type='button'
        id='profileDropdown'
        data-bs-toggle='dropdown'
        aria-expanded={isOpen}
        onClick={toggleDropdown}
        style={{ width: '45px', height: '45px', lineHeight: '1' }}
      >
        {user ? (
          <span
            className='text-white rounded-circle'
            style={{ width: '24px', height: '24px', lineHeight: '24px' }}
          >
            {user.username?.charAt(0).toUpperCase() || 'G'}
          </span>
        ) : (
          <i className='bi bi-person-circle fs-5'></i>
        )}
      </button>

      <ul
        className={`dropdown-menu ${
          isOpen ? 'show' : ''
        } dropdown-menu-start rounded-4 mt-2`}
        aria-labelledby='profileDropdown'
        id='custom-dropdown-menu'
      >
        <li>
          <div className='d-flex align-items-center px-3'>
            <div className='me-3'>
              <i className='bi bi-person-circle fs-5'></i>
            </div>
            <div>
              <button
                className='btn p-0 text-start mb-n1'
                style={{ marginBottom: '-0.25rem' }}
              >
                <Link
                  to={`/users/${user?._id || ''}`}
                  className={`text-decoration-none text-${
                    theme === 'light' ? 'dark' : 'light'
                  } `}
                >
                  {t('nav.viewProfile')}
                </Link>
              </button>
              <p className='text-body-secondary text-start m-0'>
                {user?.username || t('nav.nameFallback')}
              </p>
            </div>
          </div>
        </li>
        <li>
          <hr className='dropdown-divider' />
        </li>
        <li className='mb-3'>
          <div className='d-flex align-items-center justify-content-between px-3'>
            <div className='d-flex align-items-center'>
              <i
                className={`bi bi-sun${
                  theme === 'light' ? '' : '-fill'
                } fs-5 me-3`}
              ></i>
              <div className='p-0'>{t('nav.darkMode')}</div>
            </div>
            <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
          </div>
        </li>
        <li className='mb-3'>
          <div className='d-flex align-items-center justify-content-between px-3'>
            <div className='d-flex align-items-center'>
              <i className='bi bi-translate fs-5 me-3'></i>
              <div className='p-0'>{t('nav.language')}</div>
            </div>
            <LanguageSwitcher />
          </div>
        </li>
        <li>
          <hr className='dropdown-divider' />
        </li>
        <li className='mb-1 p-0'>
          {!user ? (
            <div className='text-center'>
              <Link to='/login' className='btn btn-primary m-2'>
                {t('nav.login')}
              </Link>
              <Link to='/register' className='btn btn-primary m-2'>
                {t('nav.register')}
              </Link>
            </div>
          ) : (
            <div className='text-center py-1'>
              <Link to='/' onClick={handleLogout} className='btn btn-primary'>
                {t('nav.logout')}
              </Link>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}
