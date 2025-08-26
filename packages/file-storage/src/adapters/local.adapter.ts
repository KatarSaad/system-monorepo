import { Injectable } from "@nestjs/common";
import { Result } from "@katarsaad/core";
import { FileAdapter } from "../services/file-storage.service";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class LocalFileAdapter implements FileAdapter {
  private readonly uploadPath: string;

  constructor() {
    this.uploadPath = "./uploads";
    this.ensureUploadDirectory();
  }

  async upload(file: Buffer, filename: string): Promise<Result<string>> {
    try {
      const filePath = path.join(this.uploadPath, filename);
      await fs.writeFile(filePath, file);
      return Result.ok(filePath);
    } catch (error) {
      return Result.fail(`Local upload failed: ${error}`);
    }
  }

  async download(filePath: string): Promise<Result<Buffer>> {
    try {
      const file = await fs.readFile(filePath);
      return Result.ok(file);
    } catch (error) {
      return Result.fail(`Local download failed: ${error}`);
    }
  }

  async delete(filePath: string): Promise<Result<void>> {
    try {
      await fs.unlink(filePath);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Local delete failed: ${error}`);
    }
  }

  async exists(filePath: string): Promise<Result<boolean>> {
    try {
      await fs.access(filePath);
      return Result.ok(true);
    } catch {
      return Result.ok(false);
    }
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      console.error("Failed to create upload directory:", error);
    }
  }
}
