// This file provides types for Google Maps API elements
// These are supplementary to the @types/google.maps package

export interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }
  
  export interface SelectedPlace {
    formatted_address: string;
    geometry: {
      location: {
        lat: () => number;
        lng: () => number;
      }
    };
    place_id: string;
    name?: string;
    address_components?: AddressComponent[];
  }
  
  export interface MapSettings {
    center: {
      lat: number;
      lng: number;
    };
    zoom: number;
  }