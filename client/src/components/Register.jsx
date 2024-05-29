import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormField from './FormField.jsx';

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

  const handleUsernameChange = (e) => {
    if (e.target.value.length === 0) {
      setUsernameWarn('Name should not be empty.');
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
    if (e.target.value.length < 1) {
      setPasswordWarn('Password must be non-empty.');
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

  const getHumanReadableError = (error) => {
    console.log(error);
    switch (error) {
      // TODO: handle Express returned errors instead
      case 'auth/email-already-in-use':
        return `The email you provided is already in use. Consider joining us with another one.`;
      default:
        return 'Invalid credentials. Please try again.';
    }
  };

  const handleSubmit = async () => {
    if (usernameWarn + emailWarn + passwordWarn + confirmPasswordWarn === '') {
      if (usernameRef.current && emailRef.current && passwordRef.current) {
        const username = usernameRef.current.value,
          email = emailRef.current.value,
          password = passwordRef.current.value;

        try {
          const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`from Register.jsx: \n${data}`);
            navigate('/login');
          } else {
            const errorData = await response.json();
            setErrorMessage(errorData.error);
            setShowError(true);
          }
        } catch (err) {
          setErrorMessage(err.message);
          setShowError(true);
        }
      }
    }
  };

  return (
    <div className='container'>
      <h1 className='text-center register'>Register</h1>
      <form className='register-form mx-auto'>
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
        {showError && (
          <h5 className='text-danger login-error'>{errorMessage}</h5>
        )}
        <br />
        <button
          type='button'
          className='btn btn-primary form-control'
          onClick={handleSubmit}
        >
          Register
        </button>
        <h4 className='register-request'>
          Got an account?{' '}
          <Link className='reg-link text-primary' to='/login'>
            Log in!
          </Link>
        </h4>
      </form>
    </div>
  );
}
