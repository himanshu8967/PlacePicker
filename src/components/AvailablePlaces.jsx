import Places from './Places.jsx';
import { useState, useEffect } from 'react';
import Error from './Error.jsx';
import { sortPlacesByDistance } from '../loc.js';
import { fetchAvailablePlaces } from '../http.js';

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPlaces() {
      setIsFetching(true);
      try {
        const places = await fetchAvailablePlaces();
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              const sortedPlaces = sortPlacesByDistance(
                places,
                position.coords.latitude,
                position.coords.longitude
              );
              setAvailablePlaces(sortedPlaces);
              setIsFetching(false);
            }
          },
          (geoError) => {
            if (isMounted) {
              setError({
                message: 'Failed to get your location. Please enable location services.',
              });
              setIsFetching(false);
            }
          }
        );
      } catch (error) {
        if (isMounted) {
          setError({
            message: error.message || 'Could not fetch places. Please try again later.',
          });
          setIsFetching(false);
        }
      }
    }

    fetchPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <Error title="An error occurred!" message={error.message} />;
  }

  return (
    <Places
      title="Available Places"
      isLoading={isFetching}
      loadingText="Fetching place data..."
      places={availablePlaces}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
