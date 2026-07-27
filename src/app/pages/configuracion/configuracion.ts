import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, BotMessages } from '../../services/config.service';

@Component({
  selector: 'app-configuracion',
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion {
  configService = inject(ConfigService);

  // Local editable copy of bot messages (so changes are only saved on "Guardar")
  editMessages = signal<BotMessages>({ ...this.configService.botMessages() });

  // New service name input
  newServiceName = signal('');

  // Feedback messages
  messagesSaved = signal(false);
  servicesChanged = signal(false);
  schedulesChanged = signal(false);

  // --- Bot Messages ---

  saveMessages(): void {
    this.configService.updateBotMessages(this.editMessages());
    this.messagesSaved.set(true);
    setTimeout(() => this.messagesSaved.set(false), 2500);
  }

  updateField(field: keyof BotMessages, value: string): void {
    this.editMessages.update(msgs => ({ ...msgs, [field]: value }));
  }

  // --- Services ---

  addService(): void {
    const name = this.newServiceName().trim();
    if (!name) return;
    this.configService.addService(name);
    this.newServiceName.set('');
    this.showServicesChanged();
  }

  removeService(id: string): void {
    this.configService.removeService(id);
    this.showServicesChanged();
  }

  private showServicesChanged(): void {
    this.servicesChanged.set(true);
    setTimeout(() => this.servicesChanged.set(false), 2500);
  }

  // --- Schedule Options ---

  addScheduleRange(): void {
    this.configService.addScheduleOption('range');
    this.showSchedulesChanged();
  }

  addCustomSchedule(): void {
    this.configService.addScheduleOption('custom');
    this.showSchedulesChanged();
  }

  removeScheduleOption(id: string): void {
    this.configService.removeScheduleOption(id);
    this.showSchedulesChanged();
  }

  updateScheduleOption(id: string, field: 'label' | 'timeRange', value: string): void {
    this.configService.updateScheduleOption(id, field, value);
  }

  private showSchedulesChanged(): void {
    this.schedulesChanged.set(true);
    setTimeout(() => this.schedulesChanged.set(false), 2500);
  }

  // --- Reset ---

  resetAll(): void {
    this.configService.resetToDefaults();
    this.editMessages.set({ ...this.configService.botMessages() });
    this.messagesSaved.set(true);
    this.servicesChanged.set(true);
    this.schedulesChanged.set(true);
    setTimeout(() => {
      this.messagesSaved.set(false);
      this.servicesChanged.set(false);
      this.schedulesChanged.set(false);
    }, 2500);
  }
}

