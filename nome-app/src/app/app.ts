import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SafePipe } from './safe.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SafePipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  city = '';
  weather = signal<any>(null);
  forecast = signal<any[]>([]);
  mapUrlSignal = signal<string>('');

  constructor(private http: HttpClient) {}

  getWeather() {
    if (!this.city) return;

    const city = encodeURIComponent(this.city);

    // Usa Open-Meteo per meteo attuale e forecast
    this.http.get(`https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`)
      .subscribe((data: any) => {
        this.weather.set(data.current_weather);
        this.forecast.set(data.daily ? data.daily.time.map((t: any, i: number) => ({
          time: t,
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          precipitation: data.daily.precipitation_sum[i]
        })) : []);
      });

    // Genera link Google Maps della città
    this.mapUrlSignal.set(`https://www.google.com/maps?q=${city}&output=embed`);
  }

  getWeatherEmoji(code: number) {
    // Semplice esempio
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 49) return '🌧️';
    return '❓';
  }

  mapUrl() {
    return this.mapUrlSignal();
  }
}
