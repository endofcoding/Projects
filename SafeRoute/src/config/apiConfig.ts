// Configuration file for SafeRoute app
// Add your Google Maps API key here

export const config = {
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || localStorage.getItem('GOOGLE_MAPS_API_KEY') || '',
};

// If you want to set the API key manually (for demo purposes):
// localStorage.setItem('GOOGLE_MAPS_API_KEY', 'YOUR_API_KEY_HERE');
