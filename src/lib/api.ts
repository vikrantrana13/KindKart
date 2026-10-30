const configuredApiBase =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const API_BASE = configuredApiBase.replace(/\/+$/, "");

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

type MapLocation = {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export const buildGoogleMapsLink = (location: MapLocation) => {
  if (location.latitude !== null && location.latitude !== undefined && location.longitude !== null && location.longitude !== undefined) {
    return 'https://www.google.com/maps?q=' + location.latitude + ',' + location.longitude;
  }

  const query = [location.address, location.city, location.state, location.pincode].filter(Boolean).join(', ');
  return query ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query) : '';
};
