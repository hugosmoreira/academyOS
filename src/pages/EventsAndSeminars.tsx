import FeatureUnavailable from '../components/FeatureUnavailable';

export default function EventsAndSeminars() {
  return (
    <FeatureUnavailable
      title="Events & Seminars"
      description="Schedule seminars, workshops, and special events."
      emptyMessage="No events scheduled yet."
    />
  );
}
