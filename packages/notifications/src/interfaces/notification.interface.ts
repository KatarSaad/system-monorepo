export interface NotificationPayload {
  to: string | string[];
  subject?: string;
  message: string;
  template?: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
}

export interface NotificationResult {
  id: string;
  status: 'sent' | 'failed' | 'pending';
  channel: string;
  recipient: string;
  sentAt?: Date;
  error?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
  body: string;
  variables: string[];
}