// lib/location.js
import * as Location from 'expo-location';

export async function getLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied, using Jacksonville defaults');
      return { 
        city: 'Jacksonville', 
        region: 'Florida', 
        coord: null,
        zipCode: null,
        neighborhood: null
      };
    }
    
    // Get high accuracy location for better recommendations
    const pos = await Location.getCurrentPositionAsync({ 
      accuracy: Location.Accuracy.High,
      maximumAge: 300000, // 5 minutes cache
      timeout: 10000 // 10 second timeout
    });
    
    const [place] = await Location.reverseGeocodeAsync({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
    
    return { 
      city: place?.city || 'Jacksonville', 
      region: place?.region || 'Florida',
      zipCode: place?.postalCode || null,
      neighborhood: place?.district || place?.subregion || null,
      coord: { 
        lat: pos.coords.latitude, 
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      }
    };
  } catch (error) {
    console.log('Location error:', error);
    return { 
      city: 'Jacksonville', 
      region: 'Florida', 
      coord: null,
      zipCode: null,
      neighborhood: null
    };
  }
}

// Keep the old function for backward compatibility
export async function getCity() {
  const location = await getLocation();
  return {
    city: location.city,
    region: location.region,
    coord: location.coord
  };
}
