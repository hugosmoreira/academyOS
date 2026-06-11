import FeatureUnavailable from '../components/FeatureUnavailable';

export default function ClassRoster() {
  return (
    <FeatureUnavailable
      title="Class Roster"
      description="View enrolled students for a scheduled class."
      emptyMessage="No roster data available yet."
    />
  );
}
