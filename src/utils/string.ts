interface GetTextWidthParams {
  text: string;
  font?: string;
}

interface TruncateTextParams {
  text: string;
  maxWidth: number;
}

/**
 * Uses canvas.measureText to compute and return the width of the
 * given text of given font in pixels.
 */
export const getTextWidth = ({
  text,
  font = '16px sans-serif',
}: GetTextWidthParams): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) return 0;

  context.font = font;
  const metrics: TextMetrics = context.measureText(text);
  return metrics.width;
};

/**
 * Truncates the given text to fit within the specified maximum width.
 */
export const truncateText = ({
  text,
  maxWidth,
}: TruncateTextParams): string => {
  const ellipsisWidth = getTextWidth({ text: '...' });
  let truncatedText = '';
  let currentWidth = 0;

  for (let i = 0; i < text.length; i++) {
    const charWidth = getTextWidth({ text: text[i] });
    if (currentWidth + charWidth + ellipsisWidth > maxWidth) {
      truncatedText += '...';
      break;
    }
    truncatedText += text[i];
    currentWidth += charWidth;
  }

  return truncatedText;
};
