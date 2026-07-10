import type { NextFunction, Request, Response } from 'express';
import {
  createUpload,
  deleteUpload,
  getUpload,
  getUploadPdfContent,
  UploadValidationError,
} from '../services/upload.service';
import { formatBytes } from '../utils/filename';

type MulterMemoryFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export async function uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file as MulterMemoryFile | undefined;
    if (!file) {
      res.status(400).json({
        error: 'No file uploaded. Use multipart field name "file".',
        code: 'FILE_MISSING',
      });
      return;
    }

    const metadata = await createUpload({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });

    res.status(201).json({
      file: {
        ...metadata,
        sizeLabel: formatBytes(metadata.size),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const metadata = await getUpload(req.params.id);
    if (!metadata) {
      res.status(404).json({ error: 'File not found.', code: 'FILE_NOT_FOUND' });
      return;
    }

    res.status(200).json({
      file: {
        ...metadata,
        sizeLabel: formatBytes(metadata.size),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPdfContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { metadata, buffer } = await getUploadPdfContent(req.params.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${metadata.originalName.replace(/"/g, '')}"`,
    );
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
}

export async function removeFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await deleteUpload(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'File not found.', code: 'FILE_NOT_FOUND' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export function isUploadValidationError(error: unknown): error is UploadValidationError {
  return error instanceof UploadValidationError;
}
