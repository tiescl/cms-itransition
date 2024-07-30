import {
  ChangeEvent,
  MouseEvent,
  MutableRefObject,
  useRef,
  useState
} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormField from './RegisterInputField.js';
import Navbar from '../../views/Navbar.jsx';
import HelpButton from '../jiraElems/HelpButton.js';

export default function Register() {
  let navigate = useNavigate();
  let { t } = useTranslation();

  var usernameRef = useRef<HTMLInputElement>(null),
    emailRef = useRef<HTMLInputElement>(null),
    passwordRef = useRef<HTMLInputElement>(null),
    confirmPasswordRef = useRef<HTMLInputElement>(null);

  var [usernameWarn, setUsernameWarn] = useState(''),
    [emailWarn, setEmailWarn] = useState(''),
    [passwordWarn, setPasswordWarn] = useState(''),
    [confirmPasswordWarn, setConfirmPasswordWarn] = useState(''),
    [errorMessage, setErrorMessage] = useState(''),
    [showError, setShowError] = useState(false);

  const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
  const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

  let handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim().length == 0) {
      setUsernameWarn('invalid_username');
    } else {
      setUsernameWarn('');
    }
  };

  let handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim().length == 0) {
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

  let handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim().length < 8) {
      setPasswordWarn('invalid_pass_length');
    } else {
      setPasswordWarn('');
    }
    if (confirmPasswordRef.current) {
      if (e.target.value != confirmPasswordRef.current.value) {
        setConfirmPasswordWarn('invalid_pass_match');
      } else {
        setConfirmPasswordWarn('');
      }
    }
  };

  let handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (passwordRef.current) {
      if (e.target.value != passwordRef.current.value) {
        setConfirmPasswordWarn('invalid_pass_match');
      } else {
        setConfirmPasswordWarn('');
      }
    }
  };

  let handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    if (
      usernameWarn + emailWarn + passwordWarn + confirmPasswordWarn ==
      ''
    ) {
      if (usernameRef.current && emailRef.current && passwordRef.current) {
        e.currentTarget.disabled = true;
        let username = usernameRef.current.value,
          email = emailRef.current.value,
          password = passwordRef.current.value;

        try {
          let response = await fetch(`${prodUrl}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });

          if (response.ok) {
            let data = await response.json();
            localStorage.setItem('auth', data.token);
            localStorage.setItem(
              'tokenExpiration',
              String(tokenExpiration)
            );
            // console.log(`from Register.jsx: \n${data}`);
            navigate('/login');
          } else {
            let errorData = await response.json();
            e.currentTarget.disabled = false;
            throw new Error(errorData.error);
          }
        } catch (err) {
          setErrorMessage((err as Error).message);
          setShowError(true);
          e.currentTarget.disabled = false;
        }
      }
    }
  };

  let handleDisabled = () => {
    let hasWarnings =
      usernameWarn + emailWarn + passwordWarn + confirmPasswordWarn != '';

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
