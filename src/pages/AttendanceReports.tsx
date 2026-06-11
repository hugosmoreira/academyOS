import FeatureUnavailable from '../components/FeatureUnavailable';

export default function AttendanceReports() {
  return (
    <FeatureUnavailable
      title="Attendance"
      description="Review class attendance and member check-ins for this gym."
      emptyMessage="No attendance records yet."
    />
  );
}
