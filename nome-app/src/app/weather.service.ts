import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}

  geocode(city: string): Observable<{ name: string; lat: number; lon: number } | null> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        if (!res?.results?.length) return null;
        const r = res.results[0];
        return { name: r.name + (r.country ? ', ' + r.country : ''), lat: r.latitude, lon: r.longitude };
      })
    );
  }

  getWeather(lat: number, lon: number): Observable<any> {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true` +
      `&hourly=relativehumidity_2m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max` +
      `&timezone=auto`;
    return this.http.get<any>(url);
  }
}
