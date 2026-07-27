import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { OrderService } from '../../services/order.service';

const COLORS = ['#e056fd', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

@Component({
  selector: 'app-ingresos',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './ingresos.html',
  styleUrl: './ingresos.scss'
})
export class Ingresos {
  orderService = inject(OrderService);

  activeTab = signal<'Resumen' | 'Servicios' | 'Ciudades'>('Resumen');
  dateFilter = signal<string>('total');

  filteredOrders = computed(() => {
    return this.orderService.orders();
  });

  totalIncome = computed(() => {
    return this.filteredOrders().reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  });

  // Build service totals for the sidebar breakdown
  serviceTotals = computed(() => {
    const totals: Record<string, number> = {};
    this.filteredOrders().forEach(o => {
      const s = (o.service || 'Otro').split('(')[0].trim();
      totals[s] = (totals[s] || 0) + (Number(o.total) || 0);
    });
    // Return sorted array of { name, value }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  });

  // LINE CHART: group orders by date, with lines per service + total
  lineChartData = computed<ChartData<'line', number[], string>>(() => {
    const orders = this.filteredOrders();
    const dailyMap: Record<string, Record<string, number>> = {};
    const serviceSet = new Set<string>();

    orders.forEach(o => {
      if (!o.date) return;
      const d = new Date(o.date);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const serviceName = (o.service || 'Otro').split('(')[0].trim();
      serviceSet.add(serviceName);

      if (!dailyMap[dateKey]) dailyMap[dateKey] = { Total: 0 };
      const amount = Number(o.total) || 0;
      dailyMap[dateKey]['Total'] = (dailyMap[dateKey]['Total'] || 0) + amount;
      dailyMap[dateKey][serviceName] = (dailyMap[dateKey][serviceName] || 0) + amount;
    });

    // Sort dates
    const sortedDates = Object.keys(dailyMap).sort();
    const serviceKeys = Array.from(serviceSet).sort();

    // Format labels
    const labels = sortedDates.map(dk => {
      const d = new Date(dk + 'T12:00:00');
      return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    });

    // Total line dataset
    const datasets: ChartData<'line', number[], string>['datasets'] = [
      {
        label: 'Total',
        data: sortedDates.map(dk => dailyMap[dk]['Total'] || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true
      }
    ];

    // Per-service line datasets
    serviceKeys.forEach((key, i) => {
      datasets.push({
        label: key,
        data: sortedDates.map(dk => dailyMap[dk][key] || 0),
        borderColor: COLORS[i % COLORS.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        borderDash: [5, 3]
      });
    });

    return { labels, datasets };
  });

  // Legend items for custom buttons
  legendItems = computed(() => {
    const data = this.lineChartData();
    return data.datasets.map((ds, i) => ({
      index: i,
      label: ds.label || '',
      color: ds.borderColor as string
    }));
  });

  // Track which datasets are hidden
  hiddenDatasets = signal<Set<number>>(new Set());

  @ViewChild(BaseChartDirective) lineChart?: BaseChartDirective;

  toggleDataset(index: number) {
    const chart = this.lineChart?.chart;
    if (!chart) return;

    const meta = chart.getDatasetMeta(index);
    meta.hidden = !meta.hidden;
    chart.update();

    // Update our tracking signal
    this.hiddenDatasets.update(set => {
      const newSet = new Set(set);
      if (meta.hidden) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ca3af',
          callback: (val) => `$${Number(val).toLocaleString()}`
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
        border: { display: false }
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false },
        border: { display: false }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e1e2e',
        titleColor: '#f3f4f6',
        bodyColor: '#9ca3af',
        borderColor: '#ffffff1a',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toLocaleString()}`
        }
      }
    }
  };

  // Services Pie Chart Data
  servicePieData = computed<ChartData<'pie', number[], string>>(() => {
    const totals: Record<string, number> = {};
    this.filteredOrders().forEach(o => {
      const s = (o.service || 'Otro').split('(')[0].trim();
      totals[s] = (totals[s] || 0) + (Number(o.total) || 0);
    });
    
    return {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: COLORS
      }]
    };
  });

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#f3f4f6' }
      }
    }
  };

  // City Bar Chart Data
  cityBarData = computed<ChartData<'bar', number[], string>>(() => {
    const totals: Record<string, number> = {};
    this.filteredOrders().forEach(o => {
      const c = o.city || 'Desconocida';
      totals[c] = (totals[c] || 0) + (Number(o.total) || 0);
    });

    return {
      labels: Object.keys(totals),
      datasets: [{
        label: 'Ingresos por Ciudad',
        data: Object.values(totals),
        backgroundColor: '#3b82f6'
      }]
    };
  });

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#ffffff1a' } },
      x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };
}
