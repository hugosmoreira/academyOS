import People from '../../../pages/People';

/**
 * Routed wrapper around the existing People list. Lets us keep `/app/students`
 * working unchanged while the gym-scoped detail/create pages share the same
 * underlying list UI.
 */
export default function StudentsListPage() {
  return <People />;
}
