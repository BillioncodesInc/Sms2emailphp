'use strict';

const QRCode = require('qrcode');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;
const path = require('path');

/**
 * Attachment Converter Module
 * Converts various formats to HTML, QR Code, or PDF
 */

class AttachmentConverter {
  /**
   * Convert text content to HTML format
   */
  static async textToHTML(text, options = {}) {
    const {
      title = 'Document',
      styling = 'modern',
      includeMetadata = true
    } = options;

    const styles = {
      modern: `
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
               line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;
               padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 40px; border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px;
              border-left: 4px solid #3498db; overflow-x: auto; }
        .metadata { font-size: 0.85em; color: #7f8c8d; margin-top: 20px;
                    padding-top: 20px; border-top: 1px solid #ecf0f1; }
      `,
      classic: `
        body { font-family: Georgia, serif; line-height: 1.8; color: #000;
               max-width: 700px; margin: 40px auto; padding: 20px; }
        h1 { text-align: center; margin-bottom: 30px; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
      `
    };

    const metadata = includeMetadata ? `
      <div class="metadata">
        <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
        <p><strong>Document:</strong> ${title}</p>
      </div>
    ` : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${styles[styling] || styles.modern}</style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <pre>${this.escapeHTML(text)}</pre>
    ${metadata}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate QR Code from data (URL, text, etc.)
   */
  static async generateQRCode(data, options = {}) {
    const {
      format = 'png', // png, svg, utf8
      errorCorrectionLevel = 'M', // L, M, Q, H
      width = 300,
      color = { dark: '#000000', light: '#FFFFFF' }
    } = options;

    try {
      switch (format) {
        case 'png':
          return await QRCode.toDataURL(data, {
            errorCorrectionLevel,
            width,
            color
          });

        case 'svg':
          return await QRCode.toString(data, {
            type: 'svg',
            errorCorrectionLevel,
            width,
            color
          });

        case 'utf8':
          return await QRCode.toString(data, {
            type: 'utf8',
            errorCorrectionLevel
          });

        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      throw new Error(`QR Code generation failed: ${error.message}`);
    }
  }

  /**
   * Convert text/HTML to PDF
   */
  static async toPDF(content, options = {}) {
    const {
      title = 'Document',
      author = 'SE Gateway',
      subject = 'Generated Document',
      fontSize = 12,
      pageSize = 'A4'
    } = options;

    try {
      const pdfDoc = await PDFDocument.create();

      // Set metadata
      pdfDoc.setTitle(title);
      pdfDoc.setAuthor(author);
      pdfDoc.setSubject(subject);
      pdfDoc.setCreationDate(new Date());

      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Split content into lines
      const lines = content.split('\n');
      let yPosition = height - 50;

      for (const line of lines) {
        if (yPosition < 50) {
          // Add new page if current page is full
          const newPage = pdfDoc.addPage();
          yPosition = newPage.getSize().height - 50;
        }

        page.drawText(line.substring(0, 100), {
          x: 50,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });

        yPosition -= fontSize + 4;
      }

      return await pdfDoc.save();
    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Create HTML with embedded QR code
   */
  static async createQRCodeHTML(data, options = {}) {
    const qrDataURL = await this.generateQRCode(data, { format: 'png', ...options });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: Arial, sans-serif;
    }
    .container {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.2);
    }
    img {
      max-width: 100%;
      border-radius: 10px;
      margin: 20px 0;
    }
    h2 { color: #333; margin-top: 0; }
    .info {
      color: #666;
      font-size: 14px;
      margin-top: 20px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>QR Code</h2>
    <img src="${qrDataURL}" alt="QR Code">
    <div class="info">
      <p><strong>Data:</strong> ${this.escapeHTML(data.substring(0, 100))}${data.length > 100 ? '...' : ''}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Escape HTML special characters
   */
  static escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Convert attachment buffer to base64 data URI
   */
  static bufferToDataURI(buffer, mimeType) {
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }
}

module.exports = AttachmentConverter;
