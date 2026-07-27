import { Injectable, signal, computed } from '@angular/core';

export interface ServiceItem {
  id: string;
  name: string;
}

export interface ScheduleOption {
  id: string;
  label: string;       // "Mañana", "Tarde", etc.
  timeRange: string;   // "08:00 AM - 12:00 PM"
  type: 'range' | 'custom';
}

export interface BotMessages {
  welcome: string;
  cityPrompt: string;
  businessPrompt: string;
  schedulePrompt: string;
  confirmationMessage: string;
  postOrderMessage: string;
  invalidServiceOption: string;
  invalidScheduleOption: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'svc-1', name: 'Edecanes' },
  { id: 'svc-2', name: 'Animación' },
  { id: 'svc-3', name: 'Mobiliario' },
];

const DEFAULT_SCHEDULE_OPTIONS: ScheduleOption[] = [
  { id: 'sch-1', label: 'Mañana', timeRange: '08:00 AM - 12:00 PM', type: 'range' },
  { id: 'sch-2', label: 'Tarde', timeRange: '12:00 PM - 04:00 PM', type: 'range' },
  { id: 'sch-3', label: 'Noche', timeRange: '04:00 PM - 08:00 PM', type: 'range' },
];

const DEFAULT_BOT_MESSAGES: BotMessages = {
  welcome: '¡Hola! Bienvenido a Cowork 🌟. ¿En qué podemos ayudarte hoy?',
  cityPrompt: '¡Excelente elección! 📝 Por favor, dinos en qué ciudad requieres el servicio (Ej. Ciudad de México, Monterrey, etc.)',
  businessPrompt: '¡Perfecto! ¿En qué negocio, tienda o local se llevará a cabo el servicio? 🏬',
  schedulePrompt: 'Entendido. ¿En qué rango de horario lo necesitas? ⏰ Responde con el número de la opción:',
  confirmationMessage: '¡Todo listo! Hemos registrado tu solicitud.\n\nTu número de orden es: *{orderId}*.\n\nPara confirmar tu pedido, por favor realiza tu pago y avísanos por este medio. 💳',
  postOrderMessage: 'Tu orden ya está en proceso. Un asesor te atenderá pronto si tienes más dudas.',
  invalidServiceOption: 'Por favor, responde con el número de la opción deseada.',
  invalidScheduleOption: 'Por favor, responde con el número de horario deseado.',
};

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // Signals for reactive state
  services = signal<ServiceItem[]>(DEFAULT_SERVICES);
  botMessages = signal<BotMessages>(DEFAULT_BOT_MESSAGES);
  scheduleOptions = signal<ScheduleOption[]>(DEFAULT_SCHEDULE_OPTIONS);

  // Computed: build the full welcome message with dynamic service list
  welcomeMessageFull = computed(() => {
    const msgs = this.botMessages();
    const svcs = this.services();
    const serviceList = svcs
      .map((s, i) => `${this.getNumberEmoji(i + 1)} ${s.name}`)
      .join('\n');
    return `${msgs.welcome}\n\n${serviceList}`;
  });

  // Computed: schedule prompt built dynamically from scheduleOptions
  schedulePromptFull = computed(() => {
    const msgs = this.botMessages();
    const options = this.scheduleOptions();
    const optionLines = options.map((opt, i) => {
      if (opt.type === 'custom') {
        return `${this.getNumberEmoji(i + 1)} ${opt.label} (escribe tu hora, ej. 10:25 am)`;
      }
      return `${this.getNumberEmoji(i + 1)} ${opt.label} (${opt.timeRange})`;
    }).join('\n');
    return `${msgs.schedulePrompt}\n\n${optionLines}`;
  });

  getNumberEmoji(n: number): string {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[n - 1] || `${n}.`;
  }

  // --- Service Management ---

  addService(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `svc-${Date.now()}`;
    this.services.update(svcs => [...svcs, { id, name: trimmed }]);
  }

  removeService(id: string): void {
    this.services.update(svcs => svcs.filter(s => s.id !== id));
  }

  // --- Schedule Option Management ---

  addScheduleOption(type: 'range' | 'custom'): void {
    const id = `sch-${Date.now()}`;
    if (type === 'custom') {
      this.scheduleOptions.update(opts => [
        ...opts,
        { id, label: 'Personalizado', timeRange: '', type: 'custom' }
      ]);
    } else {
      this.scheduleOptions.update(opts => [
        ...opts,
        { id, label: '', timeRange: '', type: 'range' }
      ]);
    }
  }

  removeScheduleOption(id: string): void {
    this.scheduleOptions.update(opts => opts.filter(o => o.id !== id));
  }

  updateScheduleOption(id: string, field: 'label' | 'timeRange', value: string): void {
    this.scheduleOptions.update(opts =>
      opts.map(o => o.id === id ? { ...o, [field]: value } : o)
    );
  }

  // --- Bot Message Management ---

  updateBotMessages(messages: BotMessages): void {
    this.botMessages.set({ ...messages });
  }

  // --- Reset ---

  resetToDefaults(): void {
    this.services.set(DEFAULT_SERVICES);
    this.botMessages.set(DEFAULT_BOT_MESSAGES);
    this.scheduleOptions.set(DEFAULT_SCHEDULE_OPTIONS);
  }
}
