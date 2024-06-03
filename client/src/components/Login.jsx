import { useRef, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import getHumanReadableError from '../utils/getHumanReadableError';

export default function Login() {
  const { setUser, setTrigger } = useContext(UserContext);
  const navigateTo = useNavigate();

  const emailRef = useRef(null),
    passwordRef = useRef(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const prodUrl =
    import.meta.env.VITE_PRODUCTION_URL ||
    'https://cms-itransition.onrender.com';
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
        setErrorMessage(getHumanReadableError(err.message));
        setShowError(true);
      }
    }
  };

  return (
    <div className='container mx-auto sm:px-4'>
      <h1 className=' mt-12 text-4xl text-center'>Log In</h1>
      <form className='w-1/3 text-xl items-center mx-auto'>
        <br />
        <label htmlFor='email'>E-mail: </label>
        <input
          className='block appearance-none w-full py-2 px-2 mb-1 text-base leading-normal bg-white text-gray-800 border border-gray-200 rounded-md'
          type='login'
          name='email'
          placeholder='E-mail'
          ref={emailRef}
          onFocus={() => setShowError(false)}
        />
        <br />
        <label htmlFor='password'>Password: </label>
        <input
          className='block appearance-none w-full py-2 px-2 mb-1 text-base leading-normal bg-white text-gray-800 border border-gray-200 rounded-md'
          type='password'
          name='password'
          placeholder='Password'
          ref={passwordRef}
          onFocus={() => setShowError(false)}
        />
        {showError && <h5 className=' text-red-700 mt-3'>{errorMessage}</h5>}
        <br />
        <button
          type='button'
          className='align-middle text-center rounded-md select-none font-normal whitespace-no-wrap py-2 px-3 no-underline bg-blue-600 text-white hover:bg-blue-500 block appearance-none w-full mb-1 text-base leading-normal border border-gray-200'
          onClick={login}
        >
          Log In
        </button>
        <h4 className='mt-6'>
          Want an account?{' '}
          <Link className='no-underline text-blue-600' to='/register'>
            Register!
          </Link>
        </h4>
      </form>
    </div>
  );
}
