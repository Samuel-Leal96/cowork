import { Component } from '@angular/core';
import { StatCards } from '../../components/stat-cards/stat-cards';
import { OrderTable } from '../../components/order-table/order-table';
import { ChatSimulator } from '../../components/chat-simulator/chat-simulator';

@Component({
  selector: 'app-dashboard',
  imports: [StatCards, OrderTable, ChatSimulator],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {}
