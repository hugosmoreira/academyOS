-- ============================================================================
-- DIAGNOSTIC ONLY: Shows the actual schema of your database.
-- Does NOT modify anything. Safe to run.
-- ============================================================================

select
  t.table_name,
  string_agg(c.column_name, ', ' order by c.ordinal_position) as columns
from information_schema.tables t
join information_schema.columns c
  on c.table_schema = t.table_schema and c.table_name = t.table_name
where t.table_schema = 'public'
  and t.table_type = 'BASE TABLE'
group by t.table_name
order by t.table_name;
