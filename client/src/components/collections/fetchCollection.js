import getHumanReadableError from '../../utils/getHumanReadableError';

async function fetchCollection(
  prodUrl,
  setCollectionData,
  setError,
  setIsLoading,
  abortSignal,
  collectionId = ''
) {
  try {
    const response = await fetch(`${prodUrl}/api/collections/${collectionId}`, {
      signal: abortSignal
    });
    if (response.ok) {
      const data = await response.json();
      setCollectionData(data);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('request_canceled');
    }
    setError(getHumanReadableError(err.message));
  } finally {
    setIsLoading(false);
  }
}

export default fetchCollection;
