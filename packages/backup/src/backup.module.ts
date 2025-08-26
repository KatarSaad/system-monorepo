import { Module, Global } from "@nestjs/common";
import { BackupService } from "./services/backup.service";
import { BackupSchedulerService } from "./services/backup-scheduler.service";
import { BackupVerificationService } from "./services/backup-verification.service";
import { MonitoringModule } from "@katarsaad/monitoring";
import { SecurityModule } from "@katarsaad/security";
import { InfrastructureModule } from "@katarsaad/infrastructure";

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), InfrastructureModule],
  providers: [BackupService, BackupSchedulerService, BackupVerificationService],
  exports: [BackupService, BackupSchedulerService, BackupVerificationService],
})
export class BackupModule {}
