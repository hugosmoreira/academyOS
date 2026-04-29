import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function WaiversPage() {
  return (
    <ModulePlaceholder
      title="Waivers & Agreements"
      description="Document templates, waiver assignments, signed waivers, and signature events."
      items={[
        'Document templates',
        'Waiver templates',
        'Student and lead assignments',
        'Signed documents',
        'Signature event history',
      ]}
    />
  );
}
