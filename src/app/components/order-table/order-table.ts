import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-table',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './order-table.html',
  styleUrl: './order-table.scss'
})
export class OrderTable {
  orderService = inject(OrderService);
  
  displayedColumns: string[] = ['id', 'customer', 'service', 'city', 'date', 'total', 'status'];

  getStatusClass(status: string): string {
    switch(status) {
      case 'Pendiente': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Pagado': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Completado': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default: return '';
    }
  }

  updateStatus(id: string, newStatus: string) {
    this.orderService.orders.update(orders => 
      orders.map(order => order.id === id ? { ...order, status: newStatus } : order)
    );
  }
}
