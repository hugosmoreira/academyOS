import FeatureUnavailable from '../components/FeatureUnavailable';

export default function FamilyProfile() {
  return (
    <FeatureUnavailable
      title="Family"
      description="View linked family members and shared billing."
      emptyMessage="Family profiles are not available yet."
    />
  );
}
