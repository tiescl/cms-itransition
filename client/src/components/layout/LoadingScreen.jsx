import { useContext } from 'react';

import ThemeContext from '../../context/ThemeContext';
import Navbar from './Navbar';

export default function LoadingScreen({
  message = 'Taking too long? Try reloading the page',
  long = 'false'
}) {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <Navbar />
      <div
        className={`position-fixed w-100 h-100 d-flex flex-column text-black justify-content-center align-items-center text-${
          theme === 'light' ? 'black' : 'white'
        }`}
        style={{ top: '0', left: '0', opacity: 0.5 }}
      >
        <div className='spinner-border flex-row' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
        <p className='flex-row mt-3 fs-4'>{message}</p>
        {long === 'true' && (
          <p className='flex-row fs-4'>
            Taking too long? Try reloading the page
          </p>
        )}
      </div>
    </>
  );
}
