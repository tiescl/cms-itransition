import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigateTo = useNavigate();

  const emailRef = useRef(null),
    passwordRef = useRef(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const login = async () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value,
        password = passwordRef.current.value;
      // TODO: replace with Fetch API

      try {
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`from Login.jsx: \n${data}`);
          navigateTo('/');
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.error);
        }
      } catch (err) {
        setErrorMessage(err.message);
        setShowErrorMessage(true);
      }

      //   signInWithEmailAndPassword(auth, email, password)
      //     .then(() => {
      //       navigateTo('/');
      //     })
      //     .catch((error) => {
      //       setErrorMessage(getHumanReadableError(error.code));
      //       setShowErrorMessage(true);
      //     });
    }
  };

  const getHumanReadableError = (error) => {
    console.log(error);
    switch (error) {
      // TODO: handle Express returned errors instead
      case 'auth/user-not-found':
        return `User not found. ${(<Link to='/register'>Register</Link>)}?`;
      case 'auth/user-disabled':
        return 'Your account has been blocked. Stay cool✌️';
      default:
        return 'Invalid credentials. Please try again.';
    }
  };

  return (
    <div className='container'>
      <h1 className='log-in'>Log In</h1>
      <form className='log-in-form align-items-center mx-auto'>
        <br />
        <label htmlFor='email'>E-mail: </label>
        <input
          className='form-control'
          type='login'
          name='email'
          placeholder='E-mail'
          ref={emailRef}
          onFocus={() => setShowErrorMessage(false)}
        />
        <br />
        <label htmlFor='password'>Password: </label>
        <input
          className='form-control'
          type='password'
          name='password'
          placeholder='Password'
          ref={passwordRef}
          onFocus={() => setShowErrorMessage(false)}
        />
        {showErrorMessage && (
          <h5 className='text-danger login-error'>{errorMessage}</h5>
        )}
        <br />
        <button
          type='button'
          className='btn btn-primary form-control'
          onClick={login}
        >
          Log In
        </button>
        <h4 className='register-request'>
          Want an account?{' '}
          <Link className='reg-link text-primary' to='/register'>
            Register!
          </Link>
        </h4>
      </form>
    </div>
  );
}
