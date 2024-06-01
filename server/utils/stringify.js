export default function stringifyDate(today) {
  const dateSetOptions = {
    day: 'numeric',
    weekday: 'short',
    year: 'numeric',
    timeZone: 'UTC',
    timeZoneName: 'short'
  };

  const fullDate = today.toLocaleTimeString() + ' ' +
  today.toLocaleDateString('en-US', dateSetOptions);

  return fullDate.split(',')[0];
}
