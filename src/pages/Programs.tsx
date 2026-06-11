import FeatureUnavailable from '../components/FeatureUnavailable';

export default function Programs() {
  return (
    <FeatureUnavailable
      title="Programs"
      description="Manage programs and class templates for this gym."
      emptyMessage="No programs configured yet."
    />
  );
}
