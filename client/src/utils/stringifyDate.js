import { useTranslation } from 'react-i18next';

export default function stringifyDate(today) {
  const { t } = useTranslation();
  const convertedDate = new Date(today);

  let primaryLocale = navigator.language || 'en-US';
  const dateOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };

  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric'
  };

  const formattedDate = convertedDate.toLocaleDateString(
    primaryLocale,
    dateOptions
  );
  const formattedTime = convertedDate.toLocaleTimeString(
    primaryLocale,
    timeOptions
  );

  return `${formattedDate} ${t('comments.at')} ${formattedTime}`;
}
