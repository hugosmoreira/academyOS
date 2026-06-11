import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function PortalWaiversPage() {
  return (
    <ModulePlaceholder
      title="Waivers & Documents"
      description="Sign and track required liability waivers and policies."
      items={[
        'Outstanding waivers',
        'Recently signed documents',
        'Waiver expiration alerts',
        'Download signed copies',
      ]}
    />
  );
}
