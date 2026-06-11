import FeatureUnavailable from '../components/FeatureUnavailable';

export default function MembershipPlans() {
  return (
    <FeatureUnavailable
      title="Membership Plans"
      description="Configure pricing plans and billing options for this gym."
      emptyMessage="No membership plans configured yet."
    />
  );
}
