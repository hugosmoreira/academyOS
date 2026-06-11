import FeatureUnavailable from '../components/FeatureUnavailable';

export default function Promotions() {
  return (
    <FeatureUnavailable
      title="Promotions"
      description="Manage belt promotions and graduation ceremonies."
      emptyMessage="No promotion candidates yet."
    />
  );
}
