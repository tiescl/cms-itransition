import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormField from './RegisterInputField.jsx';
import getHumanReadableError from '../utils/getHumanReadableError.js';
import Navbar from './Navbar.jsx';

export default function Register() {
  const navigate = useNavigate();

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

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';
  const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

  const handleUsernameChange = (e) => {
    if (e.target.value.length === 0) {
      setUsernameWarn('Username should not be empty.');
    } else {
      setUsernameWarn('');
    }
  };

  const handleEmailChange = (e) => {
    if (e.target.value.length === 0) {
      setEmailWarn('Email should not be empty.');
    } else if (
      !e.target.value.toLowerCase().match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    ) {
      setEmailWarn('Invalid email.');
    } else {
      setEmailWarn('');
    }
  };

  const handlePasswordChange = (e) => {
    if (e.target.value.length < 8) {
      setPasswordWarn('Password must be at least 8 characters long.');
    } else {
      setPasswordWarn('');
    }
    if (confirmPasswordRef.current) {
      if (e.target.value !== confirmPasswordRef.current.value) {
        setConfirmPasswordWarn('Passwords do not match.');
      } else {
        setConfirmPasswordWarn('');
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    if (passwordRef.current) {
      if (e.target.value !== passwordRef.current.value) {
        setConfirmPasswordWarn('Passwords do not match');
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
          setErrorMessage(getHumanReadableError(err.message));
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
        Register
      </h1>
      <form className='col-md-6 fs-5 mx-auto'>
        <FormField
          type='text'
          name='full_name'
          label='Username: '
          value={usernameRef}
          onChange={handleUsernameChange}
          errorMsg={usernameWarn}
          onFocus={() => setShowError(false)}
        />
        <FormField
          type='email'
          name='e-mail'
          label='E-mail: '
          value={emailRef}
          onChange={handleEmailChange}
          errorMsg={emailWarn}
          onFocus={() => setShowError(false)}
        />
        <FormField
          type='password'
          name='pwd'
          label='Password: '
          value={passwordRef}
          onChange={handlePasswordChange}
          errorMsg={passwordWarn}
          onFocus={() => setShowError(false)}
        />
        <FormField
          type='password'
          name='confirm_pwd'
          label='Confirm Password: '
          value={confirmPasswordRef}
          onChange={handleConfirmPasswordChange}
          errorMsg={confirmPasswordWarn}
          onFocus={() => setShowError(false)}
        />
        {showError && <p className='text-danger mt-3'>{errorMessage}</p>}
        <br />
        <button
          type='button'
          className='btn btn-primary form-control mt-2'
          onClick={handleSubmit}
          disabled={handleDisabled()}
        >
          Register
        </button>
        <p className='mt-3 fs-4'>
          Got an account?{' '}
          <Link className='text-primary text-decoration-none' to='/login'>
            Log in!
          </Link>
        </p>
      </form>
    </div>
  );
}
