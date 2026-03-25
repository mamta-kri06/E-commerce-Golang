export const getCurrentAddress = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );

          const data = await res.json();
          const addr = data.address;

          resolve({
            addressLine1: addr.road || addr.suburb || "",
            city: addr.city || addr.town || addr.village || "",
            state: addr.state || "",
            pincode: addr.postcode || "",
          });
        } catch (err) {
          reject("Failed to fetch address");
        }
      },
      () => reject("Location permission denied")
    );
  });
};