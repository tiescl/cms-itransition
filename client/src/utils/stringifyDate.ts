import { TFunction } from 'i18next';

export default function stringifyDate(
  today: Date,
  t: TFunction,
  forceUpdate = false // eslint-disable-line
) {
  const convertedDate = new Date(today);

  let primaryLocale = localStorage.getItem('lang') || 'en-US';
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
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
