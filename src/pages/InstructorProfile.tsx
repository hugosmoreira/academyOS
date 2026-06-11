import FeatureUnavailable from '../components/FeatureUnavailable';

export default function InstructorProfile() {
  return (
    <FeatureUnavailable
      title="Staff Profile"
      description="View staff member details, roles, and schedule."
      emptyMessage="Staff profile is not available yet."
    />
  );
}
