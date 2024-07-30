import { useTranslation } from 'react-i18next';
import Navbar from '../../views/Navbar';

export default function ErrorPage({ err = ' ' }) {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />

      <h1
        style={{ marginTop: '30vh' }}
        className='mx-auto text-center fw-semibold display-3 text-danger'
      >
        {t('errorPage.heading')}
      </h1>
      <div style={{ textAlign: 'center' }} className='fs-4 mx-1'>
        {t(err, { defaultValue: t('error.default') })}
      </div>
    </>
  );
}
