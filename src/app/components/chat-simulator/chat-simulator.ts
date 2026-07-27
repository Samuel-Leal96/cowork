import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { OrderService } from '../../services/order.service';

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

  messages = signal<Message[]>([
    { id: 1, text: "¡Hola! Bienvenido a Cowork 🌟. ¿En qué podemos ayudarte hoy?\n\n1️⃣ Edecanes\n2️⃣ Animación\n3️⃣ Mobiliario", sender: 'bot' }
  ]);
  
  inputValue = signal<string>('');
  step = signal<number>(1);
  
  orderData = {
    service: '',
    city: '',
    business: '',
    schedule: ''
  };

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
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
      
      if (currentStep === 1) {
        if (['1','2','3'].includes(userMsg)) {
          let serviceName = '';
          if (userMsg === '1') serviceName = 'Edecanes';
          if (userMsg === '2') serviceName = 'Animación';
          if (userMsg === '3') serviceName = 'Mobiliario';
          this.orderData.service = serviceName;

          botReply = "¡Excelente elección! 📝 Por favor, dinos en qué ciudad requieres el servicio (Ej. Ciudad de México, Monterrey, etc.)";
          this.step.set(2);
        } else {
          botReply = "Por favor, responde con el número de la opción deseada (1, 2 o 3).";
        }
      } else if (currentStep === 2) {
        this.orderData.city = userMsg;
        botReply = `¡Perfecto! ¿En qué negocio, tienda o local se llevará a cabo el servicio? 🏬`;
        this.step.set(3);
      } else if (currentStep === 3) {
        this.orderData.business = userMsg;
        botReply = `Entendido. ¿En qué rango de horario lo necesitas? ⏰ Responde con el número de la opción:\n\n1️⃣ Mañana (08:00 AM - 12:00 PM)\n2️⃣ Tarde (12:00 PM - 04:00 PM)\n3️⃣ Noche (04:00 PM - 08:00 PM)`;
        this.step.set(4);
      } else if (currentStep === 4) {
        if (['1','2','3'].includes(userMsg)) {
           let scheduleName = '';
           if (userMsg === '1') scheduleName = 'Mañana';
           if (userMsg === '2') scheduleName = 'Tarde';
           if (userMsg === '3') scheduleName = 'Noche';

           const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
           
           botReply = `¡Todo listo! Hemos registrado tu solicitud.\n\nTu número de orden es: *${newOrderId}*.\n\nPara confirmar tu pedido, por favor realiza tu pago y avísanos por este medio. 💳`;
           this.step.set(5);

           this.orderService.addOrder({
             id: newOrderId,
             customerName: 'Cliente Nuevo',
             phone: '+52 55 0000 0000',
             city: this.orderData.city,
             // business is skipped since it's not strictly in Order interface, or we can append it to city
             service: `${this.orderData.service} (${scheduleName})`,
             total: Math.floor(Math.random() * (8000 - 1500) + 1500),
             status: 'Pendiente',
             date: new Date().toISOString()
           });
        } else {
           botReply = "Por favor, responde con el número de horario deseado (1, 2 o 3).";
        }
      } else {
        botReply = "Tu orden ya está en proceso. Un asesor te atenderá pronto si tienes más dudas.";
      }

      this.messages.update(prev => [...prev, { id: Date.now(), text: botReply, sender: 'bot' }]);
    }, 1000);
  }
}
