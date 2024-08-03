interface RecipientsDisplayProps {
  recipients: string[];
}

export default function RecipientsDisplay({
  recipients,
}: RecipientsDisplayProps) {
  return <>{recipients}</>;
}
