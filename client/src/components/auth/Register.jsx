import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormField from './RegisterInputField.jsx';
import Navbar from '../layout/Navbar.jsx';
import HelpButton from '../jiraElems/HelpButton.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const usernameRef = useRef(null),
    emailRef = useRef(null),
    passwordRef = useRef(null),
    confirmPasswordRef = useRef(null);

  const [usernameWarn, setUsernameWarn] = useState(''),
    [emailWarn, setEmailWarn] = useState(''),
    [passwordWarn, setPasswordWarn] = useState(''),
    [confirmPasswordWarn, setConfirmPasswordWarn] = useState(''),
    [errorMessage, setErrorMessage] = useState(''),
    [showError, setShowError] = useState(false);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

  const handleUsernameChange = (e) => {
    if (e.target.value.trim().length === 0) {
      setUsernameWarn('invalid_username');
    } else {
      setUsernameWarn('');
    }
  };

  const handleEmailChange = (e) => {
    if (e.target.value.trim().length === 0) {
      setEmailWarn('invalid_email_empty');
    } else if (
      !e.target.value
        .toLowerCase()
        .trim()
        .match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    ) {
      setEmailWarn('invalid_email_match');
    } else {
      setEmailWarn('');
    }
  };

  const handlePasswordChange = (e) => {
    if (e.target.value.trim().length < 8) {
      setPasswordWarn('invalid_pass_length');
    } else {
      setPasswordWarn('');
    }
    if (confirmPasswordRef.current) {
      if (e.target.value !== confirmPasswordRef.current.value) {
        setConfirmPasswordWarn('invalid_pass_match');
      } else {
        setConfirmPasswordWarn('');
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    if (passwordRef.current) {
      if (e.target.value !== passwordRef.current.value) {
        setConfirmPasswordWarn('invalid_pass_match');
      } else {
        setConfirmPasswordWarn('');
      }
    }
  };

  const handleSubmit = async (e) => {
    if (usernameWarn + emailWarn + passwordWarn + confirmPasswordWarn === '') {
      if (usernameRef.current && emailRef.current && passwordRef.current) {
        e.target.disabled = true;
        const username = usernameRef.current.value,
          email = emailRef.current.value,
          password = passwordRef.current.value;

        try {
          const response = await fetch(`${prodUrl}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('auth', data.token);
            localStorage.setItem('tokenExpiration', tokenExpiration);
            // console.log(`from Register.jsx: \n${data}`);
            navigate('/login');
          } else {
            const errorData = await response.json();
            e.target.disabled = false;
            throw new Error(errorData.error);
          }
        } catch (err) {
          setErrorMessage(err.message);
          setShowError(true);
          e.target.disabled = false;
        }
      }
    }
  };

  const handleDisabled = () => {
    const hasWarnings =
      usernameWarn + emailWarn + passwordWarn + confirmPasswordWarn !== '';

    if (!hasWarnings) {
      return (
        !usernameRef.current?.value ||
        !passwordRef.current?.value ||
        !confirmPasswordRef.current?.value ||
        !emailRef.current?.value
      );
    }

    return true;
  };

  return (
    <div className='container'>
      <Navbar />
      <h1 className='text-center fs-1 mb-3' style={{ marginTop: '130px' }}>
        {t('register.title')}
      </h1>
      <form className='col-md-6 fs-5 mx-auto'>
        <FormField
          type='text'
          name='full_name'
          label={t('register.usernameLabel')}
          value={usernameRef}
          onChange={handleUsernameChange}
          errorMsg={usernameWarn}
          onFocus={() => setShowError(false)}
        />
        <FormField
          type='email'
          name='e-mail'
          label={t('emailLabel')}
          value={emailRef}
          onChange={handleEmailChange}
          errorMsg={emailWarn}
          onFocus={() => setShowError(false)}
        />
        <FormField
          type='password'
          name='pwd'
          label={t('passLabel')}
          value={passwordRef}
          onChange={handlePasswordChange}
          errorMsg={passwordWarn}
          onFocus={() => setShowError(false)}
        />
        <FormField
          type='password'
          name='confirm_pwd'
          label={t('register.confirmPassLabel')}
          value={confirmPasswordRef}
          onChange={handleConfirmPasswordChange}
          errorMsg={confirmPasswordWarn}
          onFocus={() => setShowError(false)}
        />
        {showError && (
          <p className='text-danger mt-3'>
            {t(errorMessage, { defaultValue: t('error.default') })}
          </p>
        )}
        <br />
        <button
          type='button'
          className='btn btn-primary form-control mt-2'
          onClick={handleSubmit}
          disabled={handleDisabled()}
        >
          {t('register.button')}
        </button>
        <p className='mt-3 fs-4'>
          {t('register.redirectMsg')}{' '}
          <Link className='text-primary text-decoration-none' to='/login'>
            {t('register.redirectLink')}
          </Link>
        </p>
      </form>
      <HelpButton />
    </div>
  );
}
