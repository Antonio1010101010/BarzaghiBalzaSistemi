import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './weather.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('MeteoApp');
  private weatherService = inject(WeatherService);

  city = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  location = signal<{ name: string; lat: number; lon: number } | null>(null);
  weather = signal<any | null>(null);
  expandedDayIndex = signal<number | null>(null);

  // Cerca la città e carica meteo
  async search() {
    const q = this.city().trim();
    if (!q) {
      this.error.set('Inserisci il nome di una città');
      return;
    }

    this.error.set(null);
    this.loading.set(true);
    this.location.set(null);
    this.weather.set(null);

    try {
      const loc = await firstValueFrom(this.weatherService.geocode(q));
      if (!loc) {
        this.error.set('Città non trovata');
        this.loading.set(false);
        return;
      }

      this.location.set(loc);
      const data = await firstValueFrom(this.weatherService.getWeather(loc.lat, loc.lon));
      this.weather.set(data);
    } catch (e: any) {
      this.error.set('Errore durante il recupero dei dati');
    } finally {
      this.loading.set(false);
    }
  }

  // Aggiorna meteo per la città già selezionata
  async refresh() {
    const loc = this.location();
    if (!loc) {
      this.error.set('Nessuna città selezionata da aggiornare');
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    try {
      const data = await firstValueFrom(this.weatherService.getWeather(loc.lat, loc.lon));
      this.weather.set(data);
    } catch {
      this.error.set('Errore durante il refresh');
    } finally {
      this.loading.set(false);
    }
  }

  // Espande / chiude i dettagli giornalieri
  toggleDay(i: number) {
    const current = this.expandedDayIndex();
    this.expandedDayIndex.set(current === i ? null : i);
  }

  // Converte il codice meteo in descrizione leggibile con emoji
  getWeatherDescription(code: number): string {
    const mapping: { [key: number]: string } = {
      0: '☀️ Cielo sereno',
      1: '🌤️ Poco nuvoloso',
      2: '⛅ Parzialmente nuvoloso',
      3: '☁️ Nuvoloso',
      45: '🌫️ Nebbia',
      48: '🌫️❄️ Nebbia ghiacciata',
      51: '🌦️ Pioggia leggera',
      53: '🌧️ Pioggia moderata',
      55: '🌧️☔ Pioggia intensa',
      61: '🌦️ Pioggia debole',
      63: '🌧️ Pioggia moderata',
      65: '🌧️☔ Pioggia intensa',
      71: '❄️ Neve leggera',
      73: '❄️ Neve moderata',
      75: '❄️ Neve intensa',
      80: '🌦️ Rovesci',
      81: '🌧️ Rovesci forti',
      95: '⛈️ Temporale',
    };
    return mapping[code] || '❓ Condizione sconosciuta';
  }
}
