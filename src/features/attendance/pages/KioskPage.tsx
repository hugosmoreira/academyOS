import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function KioskPage() {
  return (
    <ModulePlaceholder
      title="Tablet Check-In"
      description="A dedicated kiosk surface for class check-ins, backed by scoped kiosk sessions and attendance records."
      items={[
        'Kiosk session launch',
        'Student lookup and QR check-in',
        'Class session selection',
        'Late and present attendance states',
        'Kiosk audit trail',
      ]}
    />
  );
}
