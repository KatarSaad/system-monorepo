export interface IMetricsService {
  createCounter(name: string, help: string, labels?: string[]): void;
  incrementCounter(name: string, value?: number, labels?: Record<string, string>): void;
  createGauge(name: string, help: string, labels?: string[]): void;
  setGauge(name: string, value: number, labels?: Record<string, string>): void;
  createHistogram(name: string, help: string, buckets?: number[], labels?: string[]): void;
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void;
  getMetrics(): { counters: CounterMetric[]; gauges: GaugeMetric[]; histograms: HistogramMetric[] };
  reset(): void;
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