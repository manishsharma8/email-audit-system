interface GetTextWidthParams {
  text: string;
  font?: string;
}

interface TruncateTextParams {
  text: string;
  maxWidth: number;
}

interface CanFitParams {
  totalWidth: number;
  extraWidth: number;
  containerWidth: number;
}

interface TrimToFitParams {
  text: string;
  suffix: string;
  containerWidth: number;
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

/**
 * Checks if the total width plus any extra width can fit within the container width.
 */
export const canFit = ({
  totalWidth,
  containerWidth,
  extraWidth = 0,
}: CanFitParams) => {
  return totalWidth + extraWidth < containerWidth;
};

/**
 * Trims the given text so that it fits within the specified container width
 * when combined with the suffix (e.g., ellipsis).
 */
export const trimToFit = ({
  text,
  suffix,
  containerWidth,
}: TrimToFitParams) => {
  while (
    getTextWidth({ text }) + getTextWidth({ text: suffix }) >
    containerWidth
  ) {
    text = text.slice(0, -1);
  }
  return text + suffix;
};
