import { useState } from "react";
import "./App.css";

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const SpinnerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="spin">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      opacity="0.3"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

function App() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestLocation = () => {
    setLocation(null);
    setAddress(null);
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          setLocation({ latitude, longitude, accuracy });

          try {
            const url = new URL(
                "https://nominatim.openstreetmap.org/reverse"
            );

            url.search = new URLSearchParams({
              format: "jsonv2",
              lat: String(latitude),
              lon: String(longitude),
              zoom: "18",
              addressdetails: "1",
            }).toString();

            const response = await fetch(url);

            if (!response.ok) {
              throw new Error("Address lookup failed.");
            }

            const data = await response.json();

            if (data.error || !data.display_name) {
              throw new Error("No readable address was found.");
            }

            setAddress({
              full: data.display_name,
              details: data.address || {},
            });
          } catch (err) {
            setError(
                err.message ||
                "Unable to find the address. Please try again."
            );
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          switch (err.code) {
            case 1:
              setError(
                  "Location permission denied. Please allow location access."
              );
              break;
            case 2:
              setError(
                  "Location unavailable. Check your device Location setting."
              );
              break;
            case 3:
              setError("Location request timed out. Please try again.");
              break;
            default:
              setError("Unable to get your location.");
          }

          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
    );
  };

  const mapsUrl = location
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : "";

  return (
      <main className="page">
        <section className="card">
          <div className="brand">
            <span className="brand-badge">
              <PinIcon />
            </span>
            <h1>Phone Location Finder</h1>
          </div>

          <p className="subtitle">
            Share your location to see your coordinates and
            the corresponding mapped address.
          </p>

          <button onClick={requestLocation} disabled={loading}>
            {loading ? <SpinnerIcon /> : <PinIcon />}
            {loading ? "Finding location..." : "Share My Location"}
          </button>

          {location && (
              <section className="result">
                <div>
                  <h2>Coordinates</h2>
                  <div className="chips">
                    <div className="chip">
                      <span className="chip-label">Latitude</span>
                      <span className="chip-value">{location.latitude}</span>
                    </div>
                    <div className="chip">
                      <span className="chip-label">Longitude</span>
                      <span className="chip-value">{location.longitude}</span>
                    </div>
                    <div className="chip chip-wide">
                      <span className="chip-label">Reported accuracy</span>
                      <span className="chip-value">
                        {Math.round(location.accuracy)} m
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2>Detected Address</h2>

                  {address ? (
                      <div className="address">
                        <p className="full">{address.full}</p>

                        <div className="address-row">
                          <span>City/Town</span>
                          <span>
                            {address.details.city ||
                                address.details.town ||
                                address.details.village ||
                                "Not available"}
                          </span>
                        </div>

                        <div className="address-row">
                          <span>State</span>
                          <span>{address.details.state || "Not available"}</span>
                        </div>

                        <div className="address-row">
                          <span>Country</span>
                          <span>
                            {address.details.country || "Not available"}
                          </span>
                        </div>
                      </div>
                  ) : loading ? (
                      <p className="status">Looking up the address...</p>
                  ) : (
                      <p className="status">Address not available.</p>
                  )}
                </div>

                <a
                    className="maps-link"
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                  <MapIcon />
                  Open in Google Maps
                </a>
              </section>
          )}

          {error && (
              <p className="error">
                <AlertIcon />
                {error}
              </p>
          )}
        </section>
      </main>
  );
}

export default App;
