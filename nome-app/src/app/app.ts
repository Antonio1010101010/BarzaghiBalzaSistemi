import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SafePipe } from './safe.pipe';

interface WeatherData {
  name: string;
  description: string;
  temperature: number;
  windspeed: number;
  condition: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SafePipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  city: string = '';
  currentWeatherData: WeatherData | null = null;
  forecastData: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private http: HttpClient) {}

  search() {
    if (!this.city) return;
    this.error = '';
    this.loading = true;
    this.currentWeatherData = null;
    this.forecastData = [];

    const apiKey = '7cb728ea1b7f4543b7b5558139f5ae63';

    // Meteo attuale
    this.http
      .get<any>(
        `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${apiKey}&units=metric&lang=it`
      )
      .subscribe({
        next: (res) => {
          this.currentWeatherData = {
            name: res.name,
            description: res.weather[0].description,
            temperature: res.main.temp,
            windspeed: res.wind.speed,
            condition: res.weather[0].main.toLowerCase(),
          };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Città non trovata';
          this.loading = false;
        },
      });

    // Previsioni
    this.http
      .get<any>(
        `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=${apiKey}&units=metric&lang=it`
      )
      .subscribe({
        next: (res) => {
          this.forecastData = res.list.slice(0, 5).map((f: any) => ({
            date: f.dt_txt,
            temp_min: f.main.temp_min,
            temp_max: f.main.temp_max,
            rain: f.rain?.['3h'] || 0,
          }));
        },
      });
  }

  currentWeather() {
    return this.currentWeatherData;
  }

  forecast() {
    return this.forecastData;
  }

  mapUrl(): string {
    return this.currentWeatherData
      ? `https://maps.google.com/maps?q=${this.city}&output=embed`
      : '';
  }

  getWeatherClass(): string {
    if (!this.currentWeatherData) return '';
    switch (this.currentWeatherData.condition) {
      case 'clear':
        return 'sunny';
      case 'rain':
        return 'rainy';
      case 'snow':
        return 'snowy';
      case 'thunderstorm':
        return 'storm';
      case 'clouds':
        return 'cloudy';
      case 'drizzle':
        return 'drizzle';
      case 'mist':
      case 'fog':
        return 'foggy';
      default:
        return '';
    }
  }
}
