import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { aiService } from './ai.service.js';
import { ExtractedPlan } from '../types/shared.js';

export class ParserService {
  /**
   * Parse uploaded file buffer (PDF, DOCX, Markdown, Text) or raw string
   */
  public async parseFile(
    fileBuffer?: Buffer,
    originalName?: string,
    mimeType?: string,
    rawTextContent?: string
  ): Promise<ExtractedPlan> {
    let text = '';

    if (rawTextContent && rawTextContent.trim().length > 0) {
      text = rawTextContent;
    } else if (fileBuffer) {
      const ext = (originalName || '').split('.').pop()?.toLowerCase();

      if (ext === 'pdf' || mimeType === 'application/pdf') {
        const pdfData = await pdfParse(fileBuffer);
        text = pdfData.text;
      } else if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        text = docxResult.value;
      } else {
        // Markdown or plain text
        text = fileBuffer.toString('utf-8');
      }
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No readable content found in uploaded document.');
    }

    return await aiService.parseRoadmap(text);
  }
}

export const parserService = new ParserService();
