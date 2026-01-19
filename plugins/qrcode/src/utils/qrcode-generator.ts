import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: { dark: string; light: string };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M',
    ...options
  };

  if (!text || text.trim() === '') {
    throw new Error('输入内容不能为空');
  }

  try {
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (error) {
    throw new Error(`生成二维码失败: ${(error as Error).message}`);
  }
}

export function downloadQRCode(dataUrl: string, filename: string = 'qrcode.png'): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
