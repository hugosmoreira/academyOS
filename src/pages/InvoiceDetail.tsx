import FeatureUnavailable from '../components/FeatureUnavailable';

export default function InvoiceDetail() {
  return (
    <FeatureUnavailable
      title="Invoice Detail"
      description="View invoice line items and payment history."
      emptyMessage="Invoice details are not available yet."
    />
  );
}
