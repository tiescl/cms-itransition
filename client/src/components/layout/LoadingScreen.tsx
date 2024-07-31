import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import ThemeContext from '../../context/ThemeContext';
import Navbar from '../../views/Navbar';

interface IProps {
  message?: string;
  long?: boolean;
}

export default function LoadingScreen({
  message = undefined,
  long = false
}: IProps) {
  let { t } = useTranslation();
  let { theme } = useContext(ThemeContext);

  return (
    <>
      <Navbar />
      <div
        className={`position-fixed w-100 h-100 d-flex flex-column text-black justify-content-center align-items-center text-${
          theme == 'light' ? 'black' : 'white'
        }`}
        style={{ top: '0', left: '0', opacity: 0.5 }}
      >
        <div className='spinner-border flex-row' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
        {message && <p className='flex-row mt-3 fs-4'>{t(message)}</p>}
        {long == true && (
          <p className='flex-row fs-4 text-center'>{t('loading.long')}</p>
        )}
      </div>
    </>
  );
}
