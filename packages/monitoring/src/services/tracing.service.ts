import { Injectable } from '@nestjs/common';

export interface Span {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  tags: Record<string, any>;
  parentId?: string;
}

@Injectable()
export class TracingService {
  private spans = new Map<string, Span>();

  startSpan(name: string, parentId?: string): string {
    const spanId = this.generateId();
    const span: Span = {
      id: spanId,
      name,
      startTime: Date.now(),
      tags: {},
      parentId
    };
    
    this.spans.set(spanId, span);
    return spanId;
  }

  finishSpan(spanId: string, tags?: Record<string, any>): void {
    const span = this.spans.get(spanId);
    if (span) {
      span.endTime = Date.now();
      if (tags) {
        span.tags = { ...span.tags, ...tags };
      }
    }
  }

  addTag(spanId: string, key: string, value: any): void {
    const span = this.spans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  getSpan(spanId: string): Span | undefined {
    return this.spans.get(spanId);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}