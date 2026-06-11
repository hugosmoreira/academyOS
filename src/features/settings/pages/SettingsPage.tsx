import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      title="Settings"
      description="Organization, gym, branding, roles, permissions, public pages, and integrations will live here."
      items={[
        'Organization settings',
        'Gym settings',
        'Branding settings',
        'Roles and permissions',
        'Public pages',
        'Integration settings',
      ]}
    />
  );
}
