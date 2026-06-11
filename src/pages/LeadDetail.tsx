import FeatureUnavailable from '../components/FeatureUnavailable';

export default function LeadDetail() {
  return (
    <FeatureUnavailable
      title="Lead Detail"
      description="View and manage a single lead."
      emptyMessage="Lead details are not available yet."
    />
  );
}
