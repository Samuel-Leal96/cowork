import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-stat-cards',
  imports: [CommonModule, FormsModule],
  templateUrl: './stat-cards.html',
  styleUrl: './stat-cards.scss'
})
export class StatCards {
  orderService = inject(OrderService);
  
  incomeType = signal<'Pendiente' | 'Pagado'>('Pendiente');
  
  pendingIncome = computed(() => {
    return this.orderService.orders()
      .filter(o => o.status === 'Pendiente')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  });

  paidIncome = computed(() => {
    return this.orderService.orders()
      .filter(o => o.status === 'Pagado' || o.status === 'Completado')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  });

  displayIncome = computed(() => {
    return this.incomeType() === 'Pendiente' ? this.pendingIncome() : this.paidIncome();
  });
}
