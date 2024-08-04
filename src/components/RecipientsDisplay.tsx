import { useCallback, useEffect, useRef, useState } from 'react';
import { getTextWidth, truncateText } from '../utils/string';

interface RecipientsDisplayProps {
  recipients: string[];
}

const ellipsis = '...';
const ellipsisWidth = getTextWidth({ text: ellipsis });

export default function RecipientsDisplay({
  recipients,
}: RecipientsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRecipients, setVisibleRecipients] = useState<string[]>([]);
  const [trimmedCount, setTrimmedCount] = useState<number>(0);

  /**
   * Updates the visible recipients list based on the container width.
   */
  const updateVisibleRecipients = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;

    let updatedVisibleRecipients: string[] = [];
    let totalWidth = 0;

    recipients.forEach((recipient, index) => {
      const recipientWidth = getTextWidth({ text: recipient });

      // Check if adding this recipient would exceed container width
      if (totalWidth + recipientWidth > containerWidth) {
        if (index !== 0) return;

        // Truncate the first recipient if it exceeds the container width
        updatedVisibleRecipients = [
          ...updatedVisibleRecipients,
          truncateText({
            text: recipient,
            maxWidth: containerWidth - totalWidth,
          }),
        ];
      }

      // Add the recipient and update the total width
      updatedVisibleRecipients = [...updatedVisibleRecipients, recipient];
      totalWidth += recipientWidth;

      // Add the width of the comma separator if not the last recipient
      if (index < recipients.length - 1) {
        totalWidth += getTextWidth({ text: ', ' });
      }
    });

    // If there are more recipients than can fit in the container,
    // add ellipsis and count
    const remainingRecipients =
      recipients.length - updatedVisibleRecipients.length;
    if (remainingRecipients > 0) {
      setTrimmedCount(remainingRecipients);

      if (updatedVisibleRecipients[0] === recipients[0]) {
        if (totalWidth + ellipsisWidth < containerWidth) {
          updatedVisibleRecipients = [...updatedVisibleRecipients, ellipsis];
        } else {
          let lastVisibleRecipient =
            updatedVisibleRecipients[updatedVisibleRecipients.length - 1];

          while (
            getTextWidth({ text: lastVisibleRecipient }) + ellipsisWidth >
            containerWidth
          ) {
            lastVisibleRecipient = lastVisibleRecipient.slice(0, -1);
          }

          updatedVisibleRecipients[updatedVisibleRecipients.length - 1] =
            lastVisibleRecipient + ellipsis;
        }
      }
    }

    setVisibleRecipients(updatedVisibleRecipients);
  }, [containerRef.current]);

  useEffect(() => {
    updateVisibleRecipients();
  }, []);

  return (
    <div style={{ width: '100%' }} ref={containerRef}>
      {visibleRecipients.join(', ')}
    </div>
  );
}
