import { Injectable, Logger, Scope } from '@nestjs/common';

export interface MetricValue {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

export interface CounterMetric {
  name: string;
  help: string;
  value: number;
  labels: Record<string, string>;
}

export interface GaugeMetric {
  name: string;
  help: string;
  value: number;
  labels: Record<string, string>;
}

export interface HistogramMetric {
  name: string;
  help: string;
  buckets: Map<number, number>;
  sum: number;
  count: number;
  labels: Record<string, string>;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly counters = new Map<string, CounterMetric>();
  private readonly gauges = new Map<string, GaugeMetric>();
  private readonly histograms = new Map<string, HistogramMetric>();

  createCounter(name: string, help: string, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    this.counters.set(key, { name, help, value: 0, labels });
  }

  incrementCounter(name: string, value: number = 1, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    const counter = this.counters.get(key);
    if (counter) {
      counter.value += value;
    } else {
      this.createCounter(name, '', labels);
      this.incrementCounter(name, value, labels);
    }
  }

  createGauge(name: string, help: string, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, { name, help, value: 0, labels });
  }

  setGauge(name: string, value: number, help: string = '', labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    const gauge = this.gauges.get(key);
    if (gauge) {
      gauge.value = value;
    } else {
      this.gauges.set(key, { name, help, value, labels });
    }
  }

  observeHistogram(name: string, value: number, buckets: number[] = [0.1, 0.5, 1, 2.5, 5, 10], help: string = '', labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    let histogram = this.histograms.get(key);
    
    if (!histogram) {
      const bucketMap = new Map<number, number>();
      buckets.forEach(bucket => bucketMap.set(bucket, 0));
      histogram = { name, help, buckets: bucketMap, sum: 0, count: 0, labels };
      this.histograms.set(key, histogram);
    }

    histogram.sum += value;
    histogram.count++;
    
    for (const [bucket, count] of histogram.buckets) {
      if (value <= bucket) {
        histogram.buckets.set(bucket, count + 1);
      }
    }
  }

  getMetrics(): { counters: CounterMetric[]; gauges: GaugeMetric[]; histograms: HistogramMetric[] } {
    return {
      counters: Array.from(this.counters.values()),
      gauges: Array.from(this.gauges.values()),
      histograms: Array.from(this.histograms.values()),
    };
  }

  getPrometheusMetrics(): string {
    const lines: string[] = [];
    
    // Counters
    for (const counter of this.counters.values()) {
      if (counter.help) {
        lines.push(`# HELP ${counter.name} ${counter.help}`);
      }
      lines.push(`# TYPE ${counter.name} counter`);
      const labels = this.formatLabels(counter.labels);
      lines.push(`${counter.name}${labels} ${counter.value}`);
    }
    
    // Gauges
    for (const gauge of this.gauges.values()) {
      if (gauge.help) {
        lines.push(`# HELP ${gauge.name} ${gauge.help}`);
      }
      lines.push(`# TYPE ${gauge.name} gauge`);
      const labels = this.formatLabels(gauge.labels);
      lines.push(`${gauge.name}${labels} ${gauge.value}`);
    }
    
    // Histograms
    for (const histogram of this.histograms.values()) {
      if (histogram.help) {
        lines.push(`# HELP ${histogram.name} ${histogram.help}`);
      }
      lines.push(`# TYPE ${histogram.name} histogram`);
      const labels = this.formatLabels(histogram.labels);
      
      for (const [bucket, count] of histogram.buckets) {
        const bucketLabels = this.formatLabels({ ...histogram.labels, le: bucket.toString() });
        lines.push(`${histogram.name}_bucket${bucketLabels} ${count}`);
      }
      
      lines.push(`${histogram.name}_sum${labels} ${histogram.sum}`);
      lines.push(`${histogram.name}_count${labels} ${histogram.count}`);
    }
    
    return lines.join('\n') + '\n';
  }
  
  private formatLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    
    const formatted = entries
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');
    return `{${formatted}}`;
  }

  private getMetricKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}