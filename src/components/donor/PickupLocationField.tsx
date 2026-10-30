import { useEffect, useRef, useState } from 'react';
import { MapPinned } from 'lucide-react';
import { hasGoogleMapsConfig, loadGoogleMaps } from '../../lib/googleMaps';

type PickupLocation = {
  address: string;
  city: string;
  state: string;
  pincode: string;
  placeId: string;
  latitude: number | null;
  longitude: number | null;
};

type PickupLocationFieldProps = {
  onLocationSelect: (location: PickupLocation) => void;
};

const getAddressPart = (
  components: Array<{ long_name: string; short_name: string; types: string[] }> | undefined,
  targetType: string,
  useShortName = false
) => {
  const component = components?.find((item) => item.types.includes(targetType));
  if (!component) {
    return '';
  }

  return useShortName ? component.short_name : component.long_name;
};

export function PickupLocationField({ onLocationSelect }: PickupLocationFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const [statusMessage, setStatusMessage] = useState(
    hasGoogleMapsConfig() ? 'Search and select a place to fill the pickup address automatically.' : 'Google Maps autocomplete is disabled until a Vite Google Maps API key is configured.'
  );

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setupAutocomplete = async () => {
      if (!inputRef.current) {
        return;
      }

      const google = await loadGoogleMaps().catch(() => null);
      if (cancelled || !google || !google.maps || !google.maps.places || !inputRef.current) {
        if (hasGoogleMapsConfig()) {
          setStatusMessage('Google Maps could not be loaded. You can still enter the address manually.');
        }
        return;
      }

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const components = place.address_components || [];
        const location = place.geometry?.location;

        const nextLocation = {
          address: place.formatted_address || '',
          city: getAddressPart(components, 'locality') || getAddressPart(components, 'administrative_area_level_2'),
          state: getAddressPart(components, 'administrative_area_level_1', true),
          pincode: getAddressPart(components, 'postal_code'),
          placeId: place.place_id || '',
          latitude: location ? location.lat() : null,
          longitude: location ? location.lng() : null,
        };

        onLocationSelectRef.current(nextLocation);
        setStatusMessage('Google Maps location selected. Review the fields below and continue.');
      });
    };

    setupAutocomplete();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white p-2 text-emerald-600 shadow-sm">
          <MapPinned className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-semibold text-gray-900">Google Maps Pickup Search</p>
            <p className="text-sm text-gray-600">{statusMessage}</p>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pickup address with Google Maps"
            disabled={hasGoogleMapsConfig() === false}
            className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-white focus:border-emerald-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
