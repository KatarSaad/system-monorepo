export class FileUtils {
  static getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static getName(filepath: string): string {
    return filepath.split('/').pop()?.split('\\').pop() || '';
  }

  static getBaseName(filename: string): string {
    const name = this.getName(filename);
    return name.substring(0, name.lastIndexOf('.')) || name;
  }

  static formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  static isImage(filename: string): boolean {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    return imageExts.includes(this.getExtension(filename));
  }

  static isVideo(filename: string): boolean {
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    return videoExts.includes(this.getExtension(filename));
  }

  static isDocument(filename: string): boolean {
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    return docExts.includes(this.getExtension(filename));
  }

  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  static joinPath(...parts: string[]): string {
    return parts.join('/').replace(/\/+/g, '/');
  }

  static getMimeType(filename: string): string {
    const ext = this.getExtension(filename);
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'json': 'application/json',
      'xml': 'application/xml',
      'csv': 'text/csv'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}