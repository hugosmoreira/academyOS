import FeatureUnavailable from '../components/FeatureUnavailable';

export default function LeadsPipeline() {
  return (
    <FeatureUnavailable
      title="Leads"
      description="Track trial requests and prospective members for this gym."
      emptyMessage="No leads yet."
    />
  );
}
