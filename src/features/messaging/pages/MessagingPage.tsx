import ModulePlaceholder from '../../../components/ModulePlaceholder';

export default function MessagingPage() {
  return (
    <ModulePlaceholder
      title="Messaging & Announcements"
      description="Templates, campaigns, recipients, announcements, and opt-in preferences."
      items={[
        'Message templates',
        'Email and SMS campaigns',
        'Announcements',
        'Recipient targeting',
        'Notification preferences',
      ]}
    />
  );
}
