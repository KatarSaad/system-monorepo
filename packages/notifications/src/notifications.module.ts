import { Module, Global } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { EmailAdapter } from './adapters/email.adapter';
import { SmsAdapter } from './adapters/sms.adapter';
import { MonitoringModule } from '@katarsaad/monitoring';
import { CoreModule } from '@katarsaad/core';
import { QueueModule } from '@katarsaad/queue';

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), CoreModule, QueueModule],
  providers: [NotificationService, NotificationTemplateService, EmailAdapter, SmsAdapter],
  exports: [NotificationService, NotificationTemplateService, EmailAdapter, SmsAdapter],
})
export class NotificationsModule {}