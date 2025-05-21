import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

declare global {
  interface Window { google: any; }
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  imports: [ReactiveFormsModule]
})
export class FormComponent implements OnInit {
  @ViewChild('autoInput', { static: true }) autoInput!: ElementRef<HTMLInputElement>;

  addressForm!: FormGroup;
  autocomplete!: google.maps.places.Autocomplete;
  selectedAddress: any = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required]
    });

    this.loadGoogleMapsScript().then(() => {
      this.initAutocomplete();
    }).catch(err => console.error('Error loading Google Maps', err));
  }

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAkYQPOVZbjvIwodhGqeD0GvBIruF76hxQ&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  initAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.autoInput.nativeElement, {
      componentRestrictions: { country: 'pe' },
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(-7.7, -76.3),  // Sur-Oeste San Martín aprox
        new google.maps.LatLng(-5.8, -74.8)   // Norte-Este San Martín aprox
      ),
      types: ['address']  // <-- para direcciones, no solo establecimientos
    });
    

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (!place.geometry) {
        console.warn('No geometry for place selected');
        return;
      }
      this.selectedAddress = place;
      this.addressForm.patchValue({
        address: place.formatted_address || place.name || ''
      });
    });
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      console.log('Form submitted', {
        ...this.addressForm.value,
        location: {
          lat: this.selectedAddress?.geometry.location.lat(),
          lng: this.selectedAddress?.geometry.location.lng()
        }
      });
      alert('Form submitted successfully!');
    } else {
      this.addressForm.markAllAsTouched();
    }
  }

  
}
