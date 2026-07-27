import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { OrderService } from '../../services/order.service';
import { ConfigService } from '../../services/config.service';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

@Component({
  selector: 'app-chat-simulator',
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './chat-simulator.html',
  styleUrl: './chat-simulator.scss'
})
export class ChatSimulator implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  orderService = inject(OrderService);
  configService = inject(ConfigService);

  messages = signal<Message[]>([]);
  inputValue = signal<string>('');
  step = signal<number>(1);
  
  orderData = {
    service: '',
    city: '',
    business: '',
    schedule: ''
  };

  pendingCustomScheduleLabel = '';

  constructor() {
    // Initialize with the dynamic welcome message
    this.resetChat();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  resetChat(): void {
    this.messages.set([
      { id: 1, text: this.configService.welcomeMessageFull(), sender: 'bot' }
    ]);
    this.step.set(1);
    this.orderData = { service: '', city: '', business: '', schedule: '' };
    this.pendingCustomScheduleLabel = '';
    this.inputValue.set('');
  }

  handleSend(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    const userMsg = this.inputValue().trim();
    if (!userMsg) return;

    this.messages.update(prev => [...prev, { id: Date.now(), text: userMsg, sender: 'user' }]);
    this.inputValue.set('');

    setTimeout(() => {
      let botReply = '';
      const currentStep = this.step();
      const services = this.configService.services();
      const msgs = this.configService.botMessages();
      
      if (currentStep === 1) {
        // Check if user typed a valid service number
        const optionNum = parseInt(userMsg, 10);
        if (optionNum >= 1 && optionNum <= services.length) {
          const selectedService = services[optionNum - 1];
          this.orderData.service = selectedService.name;
          botReply = msgs.cityPrompt;
          this.step.set(2);
        } else {
          botReply = msgs.invalidServiceOption;
        }
      } else if (currentStep === 2) {
        this.orderData.city = userMsg;
        botReply = msgs.businessPrompt;
        this.step.set(3);
      } else if (currentStep === 3) {
        this.orderData.business = userMsg;
        botReply = this.configService.schedulePromptFull();
        this.step.set(4);
      } else if (currentStep === 4) {
        const optionNum = parseInt(userMsg, 10);
        const scheduleOpts = this.configService.scheduleOptions();

        if (optionNum >= 1 && optionNum <= scheduleOpts.length) {
          const selected = scheduleOpts[optionNum - 1];

          if (selected.type === 'custom') {
            // Ask the user to type their specific time
            this.pendingCustomScheduleLabel = selected.label;
            botReply = `Has elegido "${selected.label}". ✍️ Por favor escribe la hora exacta.\n\nFormato: hora:minutos am/pm\nEjemplos: 10:25 am, 4:45 pm`;
            this.step.set(4.5);
          } else {
            // Standard range — proceed to confirmation
            const scheduleName = `${selected.label} (${selected.timeRange})`;
            const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
            botReply = msgs.confirmationMessage.replace('{orderId}', newOrderId);
            this.step.set(5);

            this.orderService.addOrder({
              id: newOrderId,
              customerName: 'Cliente Nuevo',
              phone: '+52 55 0000 0000',
              city: this.orderData.city,
              service: `${this.orderData.service} (${scheduleName})`,
              total: Math.floor(Math.random() * (8000 - 1500) + 1500),
              status: 'Pendiente',
              date: new Date().toISOString()
            });
          }
        } else {
          botReply = msgs.invalidScheduleOption;
        }
      } else if (currentStep === 4.5) {
        // Validate custom time format (light validation: digits + am/pm)
        const timeRegex = /^\d{1,2}:\d{2}\s*(am|pm)$/i;
        if (timeRegex.test(userMsg.trim())) {
          const scheduleName = `${this.pendingCustomScheduleLabel} — ${userMsg.trim()}`;
          const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
          botReply = msgs.confirmationMessage.replace('{orderId}', newOrderId);
          this.step.set(5);

          this.orderService.addOrder({
            id: newOrderId,
            customerName: 'Cliente Nuevo',
            phone: '+52 55 0000 0000',
            city: this.orderData.city,
            service: `${this.orderData.service} (${scheduleName})`,
            total: Math.floor(Math.random() * (8000 - 1500) + 1500),
            status: 'Pendiente',
            date: new Date().toISOString()
          });
        } else {
          botReply = '⚠️ Formato no válido. Escribe la hora así: *10:25 am* o *4:45 pm*';
        }
      } else {
        botReply = msgs.postOrderMessage;
      }

      this.messages.update(prev => [...prev, { id: Date.now(), text: botReply, sender: 'bot' }]);
    }, 1000);
  }
}
