import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormField from './RegisterInputField.jsx';

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

  const getHumanReadableError = (error) => {
    // console.log(error);
    switch (error) {
      case 'email_in_use':
        return `The email you provided is already in use. Consider joining us with another one.`;
      default:
        return 'Something went wrong. Please try again.';
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
    <div className='container mx-auto sm:px-4'>
      <h1 className='text-center text-3xl mt-12'>Register</h1>
      <form className=' w-1/3 text-xl mx-auto'>
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
        {showError && <h5 className='text-red-600 mt-2'>{errorMessage}</h5>}
        <br />
        <button
          type='button'
          className='align-middle disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed text-center select-none font-normal whitespace-no-wrap rounded-md px-3 leading-normal no-underline bg-blue-600 text-white hover:bg-blue-500 block appearance-none w-full py-2 mb-1 text-base border border-gray-200'
          onClick={handleSubmit}
          disabled={handleDisabled()}
        >
          Register
        </button>
        <h4 className='mt-6'>
          Got an account?{' '}
          <Link className='no-underline text-blue-600' to='/login'>
            Log in!
          </Link>
        </h4>
      </form>
    </div>
  );
}
