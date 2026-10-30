const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let loaderPromise: Promise<typeof window.google | null> | null = null;

export const hasGoogleMapsConfig = () => googleMapsApiKey.trim().length > 0;

export const loadGoogleMaps = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve(window.google);
  }

  if (hasGoogleMapsConfig() === false) {
    return Promise.resolve(null);
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-google-maps="true"]');

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google || null), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + googleMapsApiKey + '&libraries=places';
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    script.onload = () => resolve(window.google || null);
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return loaderPromise;
};

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (input: HTMLInputElement, options?: Record<string, unknown>) => {
            addListener: (eventName: string, handler: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              place_id?: string;
              geometry?: {
                location?: {
                  lat: () => number;
                  lng: () => number;
                };
              };
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
            };
          };
        };
      };
    };
  }
}
