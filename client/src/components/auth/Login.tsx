import { useState, useContext, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserContext from '../../context/UserContext.js';
import Navbar from '../../views/Navbar.jsx';
import HelpButton from '../jiraElems/HelpButton.js';

export default function Login() {
  var { setUser, setTrigger } = useContext(UserContext);
  let navigateTo = useNavigate();
  let { t } = useTranslation();

  var [errorMessage, setErrorMessage] = useState('');
  var [showError, setShowError] = useState(false);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const token = localStorage.getItem('auth');
  const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

  let login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let formData = new FormData(e.currentTarget.form);
    let loginCreds = {
      email: formData.get('email')?.toString().trim() ?? '',
      password: formData.get('password')?.toString().trim() ?? ''
    };
    if (loginCreds.email && loginCreds.password) {
      let email = loginCreds.email,
        password = loginCreds.password;

      try {
        let response = await fetch(`${prodUrl}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          let data = await response.json();
          localStorage.setItem('auth', data.token);
          localStorage.setItem('tokenExpiration', String(tokenExpiration));
          setUser(data);
          setTrigger((prev) => !prev);
          navigateTo('/');
        } else {
          let errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (err) {
        setErrorMessage((err as Error).message);
        setShowError(true);
      }
    } else {
      setErrorMessage('invalid_login_data');
      setShowError(true);
    }
  };

  return (
    <>
      <Navbar />
      <div className='container'>
        <h1
          className='text-center fs-1 mb-2'
          style={{ marginTop: '130px' }}
        >
          {t('login.title')}
        </h1>
        <form
          onSubmit={login}
          className='col-md-6 fs-5 items-center mx-auto'
        >
          <label htmlFor='email'>{t('emailLabel')}: </label>
          <input
            className='form-control mb-4'
            type='login'
            name='email'
            placeholder={t('emailLabel')}
            onFocus={() => setShowError(false)}
          />
          <label htmlFor='password'>{t('passLabel')}: </label>
          <input
            className='form-control mb-3'
            type='password'
            name='password'
            placeholder={t('passLabel')}
            onFocus={() => setShowError(false)}
          />
          {showError && (
            <p className='text-danger mt-1'>
              {t(errorMessage, { defaultValue: t('error.default') })}
            </p>
          )}

          <button
            type='submit'
            className='btn btn-primary form-control mt-4'
          >
            {t('login.button')}
          </button>
          <p className='mt-3 fs-4'>
            {t('login.redirectMsg')}{' '}
            <Link
              className='text-primary text-decoration-none'
              to='/register'
            >
              {t('login.redirectLink')}
            </Link>
          </p>
        </form>
        <HelpButton />
      </div>
    </>
  );
}
