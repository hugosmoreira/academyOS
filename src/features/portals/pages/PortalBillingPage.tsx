import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function PortalBillingPage() {
  return (
    <ModulePlaceholder
      title="Billing"
      description="Review your account balance, payment method, and invoices."
      items={[
        'Current balance',
        'Next autopay',
        'Stored payment methods',
        'Invoice history',
        'Update card on file',
      ]}
    />
  );
}
