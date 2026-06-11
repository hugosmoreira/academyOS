-- Adds direct belt/stripes columns on students for fast filtering and simple
-- list views. The richer rank/program tracking via student_program_enrollments
-- and student_rank_history remains the source of truth for promotions.
alter table public.students
  add column if not exists belt text,
  add column if not exists stripes integer not null default 0;

create index if not exists students_belt_idx on public.students(gym_id, belt);
