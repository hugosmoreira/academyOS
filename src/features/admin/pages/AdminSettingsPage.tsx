import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function AdminSettingsPage() {
  return (
    <ModulePlaceholder
      title="Platform Settings"
      description="Tenant-wide configuration for the AcademyOS platform team."
      items={[
        'Email branding (invite, password reset)',
        'Default trial length',
        'Audit log retention',
        'Feature flags',
        'Integrations',
      ]}
    />
  );
}
