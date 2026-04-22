import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { createReadStream, promises as fs } from 'fs';
import { IPCLogger } from '../utils/IPCLogger';

/**
 * 文件块信息
 */
interface FileChunk {
  index: number;
  total: number;
  data: string;
  isLast: boolean;
}

/**
 * 文件块读取配置
 */
interface ReadFileChunkedOptions {
  chunkSize?: number; // 块大小（字节），默认 8KB
  encoding?: BufferEncoding; // 编码，默认 utf-8
}

const logger = IPCLogger.getInstance();

/**
 * 分块读取文件
 *
 * @param filePath 文件路径
 * @param options 配置选项
 * @param onChunk 每个块的回调
 */
export async function readFileChunked(
  filePath: string,
  options: ReadFileChunkedOptions = {},
  onChunk: (chunk: FileChunk) => void
): Promise<void> {
  const { chunkSize = 8192, encoding = 'utf-8' } = options;

  return new Promise((resolve, reject) => {
    try {
      const stream = createReadStream(filePath, { encoding });
      let index = 0;
      let chunkData = '';

      stream.on('data', (chunk: string) => {
        chunkData += chunk;

        // 当累积数据达到chunkSize时，发送一个块
        while (chunkData.length >= chunkSize) {
          const data = chunkData.slice(0, chunkSize);
          chunkData = chunkData.slice(chunkSize);

          onChunk({
            index: index++,
            total: -1, // 未知总数
            data,
            isLast: false
          });
        }

        logger.debug('FileHandlers', `发送文件块 ${index}, 大小: ${data.length}`);
      });

      stream.on('end', () => {
        // 发送最后一个块
        if (chunkData.length > 0) {
          onChunk({
            index,
            total: index + 1,
            data: chunkData,
            isLast: true
          });
        }

        logger.info('FileHandlers', `文件读取完成，共 ${index + 1} 个块`);
        resolve();
      });

      stream.on('error', (error) => {
        logger.error('FileHandlers', `文件读取错误: ${error}`);
        reject(error);
      });
    } catch (error) {
      logger.error('FileHandlers', `创建文件流失败: ${error}`);
      reject(error);
    }
  });
}

/**
 * 注册文件处理相关的 IPC 处理器
 */
export function registerFileHandlers(): void {
  /**
   * 分块读取文件
   */
  ipcMain.handle(
    'file:readChunked',
    async (event: IpcMainInvokeEvent, filePath: string, options: ReadFileChunkedOptions) => {
      logger.info('FileHandlers', `开始分块读取文件: ${filePath}`);

      const chunks: FileChunk[] = [];

      await readFileChunked(filePath, options, (chunk) => {
        chunks.push(chunk);

        // 通过 IPC 发送块到渲染进程
        event.sender.send('file:chunk', {
          filePath,
          chunk
        });

        logger.debug('FileHandlers', `已发送块 ${chunk.index + 1}`);
      });

      return {
        success: true,
        totalChunks: chunks.length,
        filePath
      };
    }
  );

  /**
   * 获取文件大小（用于进度显示）
   */
  ipcMain.handle('file:getSize', async (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        success: true,
        size: stats.size,
        path: filePath
      };
    } catch (error) {
      logger.error('FileHandlers', `获取文件大小失败: ${error}`);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  });

  /**
   * 判断是否为大文件
   */
  ipcMain.handle(
    'file:isLargeFile',
    async (_event: IpcMainInvokeEvent, filePath: string, threshold = 5 * 1024 * 1024) => {
      // 默认阈值 5MB
      try {
        const stats = await fs.stat(filePath);
        const isLarge = stats.size > threshold;

        return {
          success: true,
          isLarge,
          size: stats.size,
          threshold
        };
      } catch (error) {
        logger.error('FileHandlers', `判断文件大小失败: ${error}`);
        return {
          success: false,
          error: (error as Error).message
        };
      }
    }
  );

  logger.info('FileHandlers', '文件处理 IPC 处理器已注册');
}
