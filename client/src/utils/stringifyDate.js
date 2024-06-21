export default function stringifyDate(today, t, forceUpdate = false) {
  const convertedDate = new Date(today);

  let primaryLocale = localStorage.getItem('lang') || 'en-US';
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
