import { useRef, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserContext from '../../context/UserContext.jsx';
import Navbar from '../layout/Navbar.jsx';
import HelpButton from '../jiraElems/HelpButton.jsx';

export default function Login() {
  const { setUser, setTrigger } = useContext(UserContext);
  const navigateTo = useNavigate();
  const { t } = useTranslation();

  const emailRef = useRef(null),
    passwordRef = useRef(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');
  const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

  const login = async () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value,
        password = passwordRef.current.value;

      try {
        const response = await fetch(`${prodUrl}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth', data.token);
          localStorage.setItem('tokenExpiration', tokenExpiration);
          setUser(data);
          setTrigger((prev) => !prev);
          navigateTo('/');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        setErrorMessage(err.message);
        setShowError(true);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className='container'>
        <h1 className='text-center fs-1 mb-2' style={{ marginTop: '130px' }}>
          {t('login.title')}
        </h1>
        <form className='col-md-6 fs-5 items-center mx-auto'>
          <label htmlFor='email'>{t('emailLabel')}: </label>
          <input
            className='form-control mb-4'
            type='login'
            name='email'
            placeholder={t('emailLabel')}
            ref={emailRef}
            onFocus={() => setShowError(false)}
          />
          <label htmlFor='password'>{t('passLabel')}: </label>
          <input
            className='form-control mb-3'
            type='password'
            name='password'
            placeholder={t('passLabel')}
            ref={passwordRef}
            onFocus={() => setShowError(false)}
          />
          {showError && (
            <p className='text-danger mt-1'>
              {t(errorMessage, { defaultValue: t('error.default') })}
            </p>
          )}

          <button
            type='button'
            className='btn btn-primary form-control mt-4'
            onClick={login}
          >
            {t('login.button')}
          </button>
          <p className='mt-3 fs-4'>
            {t('login.redirectMsg')}{' '}
            <Link className='text-primary text-decoration-none' to='/register'>
              {t('login.redirectLink')}
            </Link>
          </p>
        </form>
        <HelpButton />
      </div>
    </>
  );
}
