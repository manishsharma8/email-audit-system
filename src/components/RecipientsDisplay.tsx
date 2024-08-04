import { useCallback, useEffect, useRef, useState } from 'react';
import { canFit, getTextWidth, trimToFit, truncateText } from '../utils/string';
import RecipientsBadge from './RecipientsBadge';
import styled from 'styled-components';

interface RecipientsDisplayProps {
  recipients: string[];
}

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: normal;
  word-break: break-all;
`;

const Recipients = styled.div`
  flex-basis: 100%;
`;

const separator = ', ';
const ellipsis = '...';
const ellipsisWidth = getTextWidth({ text: ellipsis });

function RecipientsDisplay({ recipients }: RecipientsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRecipients, setVisibleRecipients] = useState<string[]>([]);
  const [trimmedCount, setTrimmedCount] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState(0);

  /**
   * Updates the visible recipients list based on the container width.
   */
  const updateVisibleRecipients = useCallback(() => {
    if (!(containerRef.current && containerWidth)) return;
    let updatedVisibleRecipients: string[] = [];
    let totalWidth = 0;

    recipients.forEach((recipient, index) => {
      const recipientWidth = getTextWidth({ text: recipient });

      // Check if adding this recipient would exceed container width
      if (!canFit({ totalWidth, extraWidth: recipientWidth, containerWidth })) {
        if (index !== 0) return;

        // Truncate the first recipient if it exceeds the container width
        const truncatedText = truncateText({
          text: recipient,
          maxWidth: containerWidth - totalWidth,
        });

        updatedVisibleRecipients = [...updatedVisibleRecipients, truncatedText];
        totalWidth += getTextWidth({ text: truncatedText });
        return;
      }

      // Add the recipient and update the total width
      updatedVisibleRecipients = [...updatedVisibleRecipients, recipient];
      totalWidth += recipientWidth;

      // Add the width of the comma separator if not the last recipient
      if (index < recipients.length - 1) {
        totalWidth += getTextWidth({ text: separator });
      }
    });

    // Determine the number of remaining recipients that cannot fit in the container
    const remainingRecipients =
      recipients.length - updatedVisibleRecipients.length;

    if (remainingRecipients > 0) {
      setTrimmedCount(remainingRecipients);

      const lastVisibleRecipient =
        updatedVisibleRecipients[updatedVisibleRecipients.length - 1];

      // If the last visible recipient is the first recipient in the list
      if (lastVisibleRecipient === recipients[0]) {
        setTrimmedCount(remainingRecipients);

        // Check if there is enough space to fit the ellipsis in the remaining width
        if (canFit({ totalWidth, extraWidth: ellipsisWidth, containerWidth })) {
          updatedVisibleRecipients = [...updatedVisibleRecipients, ellipsis];
        } else {
          // Trim the last visible recipient to fit with the ellipsis
          updatedVisibleRecipients[updatedVisibleRecipients.length - 1] =
            trimToFit({
              text: lastVisibleRecipient,
              suffix: ellipsis,
              containerWidth,
            });
        }
      } else {
        if (
          // If not enough space, remove the last recipient and add ellipsis
          !(
            updatedVisibleRecipients[0] === lastVisibleRecipient ||
            canFit({
              totalWidth,
              extraWidth: getTextWidth({ text: separator + ellipsis }),
              containerWidth,
            })
          )
        ) {
          updatedVisibleRecipients.pop();
          updatedVisibleRecipients = [...updatedVisibleRecipients, ellipsis];
          setTrimmedCount(prev => prev + 1);
        } else {
          // If there's space to add ellipsis, add them
          if (totalWidth + ellipsisWidth < containerWidth) {
            updatedVisibleRecipients = [...updatedVisibleRecipients, ellipsis];
          }
        }
      }
    }

    setVisibleRecipients(updatedVisibleRecipients);
  }, [recipients, containerWidth]);

  useEffect(() => {
    updateVisibleRecipients();
  }, [updateVisibleRecipients]);

  useEffect(() => {
    // observing container for any width changes
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      containerRef.current && observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <Container>
      <Recipients ref={containerRef}>
        {visibleRecipients.join(separator)}
      </Recipients>
      {trimmedCount > 0 && <RecipientsBadge numTruncated={trimmedCount} />}
    </Container>
  );
}

export default RecipientsDisplay;
