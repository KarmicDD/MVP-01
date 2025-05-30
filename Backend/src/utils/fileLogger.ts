import fs from 'fs';
import path from 'path';

/**
 * Utility for logging data to files
 * Useful for debugging and tracking API responses
 */
class FileLogger {
  private logDir: string;

  constructor() {
    // Set the log directory to the logs folder in the project root
    this.logDir = path.join(__dirname, '..', '..', 'logs');
    this.ensureLogDirectoryExists();
  }

  /**
   * Ensure the log directory exists
   */
  private ensureLogDirectoryExists(): void {
    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
        console.log(`Created log directory: ${this.logDir}`);
      } catch (error) {
        console.error('Error creating log directory:', error);
      }
    }
  }

  /**
   * Log data to a file
   * @param data The data to log
   * @param prefix Prefix for the log file name
   * @param extension File extension (default: .json)
   * @returns The path to the log file
   */
  public logToFile(data: any, prefix: string = 'log', extension: string = '.json'): string | null {
    try {
      // Create a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `${prefix}_${timestamp}${extension}`;
      const filePath = path.join(this.logDir, fileName);

      // Convert data to string if it's not already
      const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

      // Write to file
      fs.writeFileSync(filePath, dataString);
      console.log(`Data logged to file: ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error('Error logging data to file:', error);
      return null;
    }
  }

  /**
   * Log an object to a JSON file
   * @param data The object to log
   * @param prefix Prefix for the log file name
   * @returns The path to the log file
   */
  public logObjectToJsonFile(data: object, prefix: string = 'object'): string | null {
    return this.logToFile(data, prefix, '.json');
  }

  /**
   * Log text to a file
   * @param text The text to log
   * @param prefix Prefix for the log file name
   * @returns The path to the log file
   */
  public logTextToFile(text: string, prefix: string = 'text'): string | null {
    return this.logToFile(text, prefix, '.txt');
  }
}

// Export a singleton instance
export default new FileLogger();
