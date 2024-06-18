import Navbar from './Navbar.jsx';
import { useTranslation } from 'react-i18next';

export default function ErrorPage({ err = ' ' }) {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />

      <h1
        style={{ fontSize: '50px', marginTop: '40vh', color: 'red' }}
        className='mx-auto text-center fw-semibold'
      >
        {t('errorPage.heading')}
      </h1>
      <div style={{ fontSize: '50px', textAlign: 'center' }}>
        {t(err, { defaultValue: t('error.default') })}
      </div>
    </>
  );
}
