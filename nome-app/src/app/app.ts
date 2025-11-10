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

  async search() {
    const q = this.city().trim();
    if (!q) {
      this.error('Inserisci il nome di una città');
      return;
    }
    this.error(null);
    this.loading(true);
    this.location(null);
    this.weather(null);
    try {
      const loc = await firstValueFrom(this.weatherService.geocode(q));
      if (!loc) {
        this.error('Città non trovata');
        this.loading(false);
        return;
      }
      this.location(loc);
      const data = await firstValueFrom(this.weatherService.getWeather(loc.lat, loc.lon));
      this.weather(data);
    } catch (e: any) {
      this.error('Errore durante il recupero dei dati');
    } finally {
      this.loading(false);
    }
  }

  async refresh() {
    const loc = this.location();
    if (!loc) {
      this.error('Nessuna città selezionata da aggiornare');
      return;
    }
    this.error(null);
    this.loading(true);
    try {
      const data = await firstValueFrom(this.weatherService.getWeather(loc.lat, loc.lon));
      this.weather(data);
    } catch {
      this.error('Errore durante il refresh');
    } finally {
      this.loading(false);
    }
  }

  toggleDay(i: number) {
    const current = this.expandedDayIndex();
    this.expandedDayIndex.set(current === i ? null : i);
  }
}
