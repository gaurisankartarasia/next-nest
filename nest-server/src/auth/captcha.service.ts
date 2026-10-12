import { createHmac, randomBytes } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';

export interface CaptchaPayload {
  captchaId: string;
  image: string; // SVG data URL or raw SVG string
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Unambiguous characters
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'super-secret-captcha-signing-key-2026';
const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class CaptchaService {
  /**
   * Generates a random alphanumeric code of given length.
   */
  private generateRandomText(length = 5): string {
    let result = '';
    const bytes = randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += CHARS[bytes[i] % CHARS.length];
    }
    return result;
  }

  /**
   * Creates an HMAC signature for code + timestamp.
   */
  private sign(text: string, timestamp: number): string {
    const hmac = createHmac('sha256', CAPTCHA_SECRET);
    hmac.update(`${text.toUpperCase()}:${timestamp}`);
    return hmac.digest('hex');
  }

  /**
   * Generates an SVG image string for the given text.
   */
  private generateSvg(text: string, width = 140, height = 44): string {
    const chars = text.split('');
    const charSpacing = width / (chars.length + 1);

    // Random noise lines
    let linesSvg = '';
    for (let i = 0; i < 4; i++) {
      const x1 = Math.floor(Math.random() * width);
      const y1 = Math.floor(Math.random() * height);
      const x2 = Math.floor(Math.random() * width);
      const y2 = Math.floor(Math.random() * height);
      const stroke = `rgba(${Math.floor(Math.random() * 120)}, ${Math.floor(Math.random() * 120)}, ${Math.floor(Math.random() * 120)}, 0.45)`;
      linesSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${1 + Math.random()}" />`;
    }

    // Random noise circles/dots
    let dotsSvg = '';
    for (let i = 0; i < 25; i++) {
      const cx = Math.floor(Math.random() * width);
      const cy = Math.floor(Math.random() * height);
      const r = (Math.random() * 1.5 + 0.5).toFixed(1);
      const fill = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.4)`;
      dotsSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />`;
    }

    // Distorted characters
    const colors = ['#0f172a', '#1e293b', '#1e1b4b', '#0369a1', '#15803d', '#334155'];
    let textSvg = '';
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const x = Math.floor(charSpacing * (i + 0.8));
      const y = Math.floor(height / 2 + 6 + (Math.random() * 6 - 3));
      const angle = Math.floor((Math.random() - 0.5) * 35); // -17 to +17 deg
      const color = colors[i % colors.length];
      const fontSize = Math.floor(22 + Math.random() * 4);

      textSvg += `<text x="${x}" y="${y}" font-family="monospace, monospace" font-size="${fontSize}" font-weight="bold" fill="${color}" transform="rotate(${angle}, ${x}, ${y})">${char}</text>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #f1f5f9; border-radius: 6px;">${linesSvg}${dotsSvg}${textSvg}</svg>`;
  }

  /**
   * Generates a new server-side captcha with an encrypted/signed token.
   */
  generate(): CaptchaPayload {
    const text = this.generateRandomText();
    const timestamp = Date.now();
    const signature = this.sign(text, timestamp);
    // Token structure: base64(timestamp:signature)
    const captchaId = Buffer.from(`${timestamp}:${signature}`).toString('base64');
    const svg = this.generateSvg(text);
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    return {
      captchaId,
      image: dataUri,
    };
  }

  /**
   * Validates user-submitted answer against captcha token.
   */
  verify(captchaId: string, userInput: string): boolean {
    if (!captchaId || !userInput) {
      throw new BadRequestException('Security captcha code is required.');
    }

    let timestampStr = '';
    let expectedSignature = '';

    try {
      const decoded = Buffer.from(captchaId, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 2) {
        throw new BadRequestException('Invalid captcha token format.');
      }
      timestampStr = parts[0];
      expectedSignature = parts[1];
    } catch {
      throw new BadRequestException('Invalid captcha verification token.');
    }

    const timestamp = Number(timestampStr);
    if (isNaN(timestamp) || Date.now() - timestamp > CAPTCHA_EXPIRY_MS) {
      throw new BadRequestException('Captcha has expired. Please refresh and try again.');
    }

    const actualSignature = this.sign(userInput.trim().toUpperCase(), timestamp);
    if (actualSignature !== expectedSignature) {
      throw new BadRequestException('Invalid captcha code. Please try again.');
    }

    return true;
  }
}

