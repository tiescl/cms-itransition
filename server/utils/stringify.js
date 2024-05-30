export default function stringifyDate(today) {
  const dateSetOptions = {
    day: 'numeric',
    weekday: 'short',
    year: 'numeric',
    timeZone: 'UTC',
    timeZoneName: 'short'
  };

  return (
    today.toLocaleTimeString() +
    ' ' +
    today.toLocaleDateString('en-US', dateSetOptions)
  );
}
