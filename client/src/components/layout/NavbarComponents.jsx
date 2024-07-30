import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import UserContext from '../../context/UserContext';

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
    localStorage.removeItem('auth');
    localStorage.removeItem('tokenExpiration');
    console.log('logged out');
    setTrigger((prev) => !prev);
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
              <Link
                to='/'
                onClick={handleLogout}
                className='btn btn-primary'
              >
                {t('nav.logout')}
              </Link>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}

function NavbarSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='d-flex my-4 me-2'
      role='search'
    >
      <div className='input-group'>
        <input
          className='form-control'
          type='search'
          placeholder={t('nav.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className='btn btn-primary' type='submit'>
          <i className='bi bi-search'></i>
        </button>
      </div>
    </form>
  );
}

export { Actions, ProfileDropdown, NavbarSearch };
