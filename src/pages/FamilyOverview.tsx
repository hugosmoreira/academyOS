import FeatureUnavailable from '../components/FeatureUnavailable';

export default function FamilyOverview() {
  return (
    <FeatureUnavailable
      title="Families"
      description="Overview of family accounts linked to this gym."
      emptyMessage="No family accounts yet."
    />
  );
}
