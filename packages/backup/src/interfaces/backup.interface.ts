export interface BackupConfig {
  strategy: 'full' | 'incremental' | 'differential';
  schedule: string; // cron expression
  retention: RetentionPolicy;
  compression: boolean;
  encryption: boolean;
  destination: BackupDestination;
}

export interface RetentionPolicy {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface BackupDestination {
  type: 'local' | 's3' | 'azure' | 'gcp';
  path: string;
  credentials?: Record<string, any>;
}

export interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  size: number;
  checksum: string;
  createdAt: Date;
  path: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}