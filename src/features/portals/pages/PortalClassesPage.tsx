import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function PortalClassesPage() {
  return (
    <ModulePlaceholder
      title="My Classes"
      description="Browse your upcoming sessions and class history."
      items={[
        'Upcoming classes',
        'Class history',
        'Reserve a spot',
        'Cancel a reservation',
      ]}
    />
  );
}
