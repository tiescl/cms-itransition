export default function stringifyDate(today) {
  let primaryLocale = navigator.language || 'en-US';
  const dateOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };

  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'UTC',
    timeZoneName: 'long'
  };

  const formattedDate = today.toLocaleDateString(primaryLocale, dateOptions);
  const formattedTime = today.toLocaleTimeString(primaryLocale, timeOptions);

  return `${formattedDate} ${formattedTime}`;
}
