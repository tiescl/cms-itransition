import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../context/ThemeContext';

interface IProps {
  message: string;
}

export default function InlineLoadingScreen({ message }: IProps) {
  let { t } = useTranslation();
  let { theme } = useContext(ThemeContext);

  return (
    <div
      className={`position-relative w-100 h-100 d-flex flex-column text-black justify-content-center align-items-center text-${
        theme == 'light' ? 'black' : 'white'
      }`}
      style={{ opacity: 0.5 }}
    >
      <div className='spinner-border' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
      <p className='mt-3 fs-4'>{t(message)}</p>
    </div>
  );
}
