import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function PortalAttendancePage() {
  return (
    <ModulePlaceholder
      title="My Attendance"
      description="See every class you've checked into."
      items={[
        'Per-month summary',
        'Class-by-class log',
        'Excused absences',
        'Streak / consistency badge',
      ]}
    />
  );
}
