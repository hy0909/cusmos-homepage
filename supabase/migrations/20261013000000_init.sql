-- CUSMOS 홈페이지 Supabase 설정
-- Supabase 대시보드 > SQL Editor에 통째로 붙여 넣고 Run을 누르면 된다.
-- 여러 번 실행해도 문제없도록 작성했다.

-- ───────── 관리자 목록 ─────────
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ───────── 게시판 ─────────
create table if not exists public.notices (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  date date not null default current_date,
  pinned boolean not null default false,
  published boolean not null default true,
  body text default '',
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  source text,
  date date not null default current_date,
  thumbnail text,
  link text,
  summary text,
  body text default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.careers (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  team text,
  location text,
  type text default '정규직',
  career text default '경력 무관',
  date date not null default current_date,
  deadline date,
  status text not null default 'open' check (status in ('open', 'closed')),
  apply text,
  body text default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ci_items (
  id text primary key default gen_random_uuid()::text,
  kind text not null default 'logo' check (kind in ('logo', 'color')),
  sort_order int default 10,
  title text not null,
  description text,
  preview text,
  bg text default 'dark',
  files jsonb not null default '[]'::jsonb,
  hex text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  company text,
  ceo text,
  biz_no text,
  phone text,
  email text,
  address text,
  updated_at timestamptz not null default now()
);

-- ───────── 접근 권한 ─────────
-- 방문자는 공개 글만 읽고, admins 표에 있는 계정만 쓰고 고치고 지울 수 있다.
alter table public.admins enable row level security;
alter table public.notices enable row level security;
alter table public.news enable row level security;
alter table public.careers enable row level security;
alter table public.ci_items enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (lower(email) = lower(auth.jwt() ->> 'email'));

do $$
declare t text;
begin
  foreach t in array array['notices', 'news', 'careers', 'ci_items'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (published or public.is_admin())', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read" on public.site_settings;
create policy "public read" on public.site_settings for select using (true);
drop policy if exists "admin write" on public.site_settings;
create policy "admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ───────── 파일 저장소 ─────────
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "uploads admin insert" on storage.objects;
create policy "uploads admin insert" on storage.objects for insert with check (bucket_id = 'uploads' and public.is_admin());
drop policy if exists "uploads admin update" on storage.objects;
create policy "uploads admin update" on storage.objects for update using (bucket_id = 'uploads' and public.is_admin());
drop policy if exists "uploads admin delete" on storage.objects;
create policy "uploads admin delete" on storage.objects for delete using (bucket_id = 'uploads' and public.is_admin());

-- ───────── 처음 데이터 ─────────
insert into public.site_settings (id, company, ceo) values (1, '주식회사 커즈모스', '이창우')
on conflict (id) do nothing;

insert into public.notices (id, title, date, pinned, body) values (
  'n-20261012-open', '커즈모스 홈페이지를 새로 열었습니다', '2026-10-12', true,
  E'커즈모스 홈페이지를 새로 열었습니다.\n\n앞으로 이곳에서 회사 소식과 공지, 채용 정보를 알려 드리겠습니다. 솔루션 도입이나 제휴는 [도입 문의](contact.html) 페이지를 이용해 주세요.'
) on conflict (id) do nothing;

insert into public.ci_items (id, kind, sort_order, title, description, bg, preview, files, hex) values
  ('ci-wordmark-white', 'logo', 1, '워드마크 (흰색)', '어두운 배경에 사용', 'dark', 'uploads/ci/cusmos-wordmark-white.png', '[{"name":"PNG","path":"uploads/ci/cusmos-wordmark-white.png"}]', null),
  ('ci-wordmark-black', 'logo', 2, '워드마크 (검정)', '밝은 배경에 사용', 'light', 'uploads/ci/cusmos-wordmark-black.png', '[{"name":"PNG","path":"uploads/ci/cusmos-wordmark-black.png"}]', null),
  ('ci-symbol', 'logo', 3, '심볼', '파비콘·프로필 이미지에 사용', 'dark', 'uploads/ci/cusmos-symbol.png', '[{"name":"PNG","path":"uploads/ci/cusmos-symbol.png"}]', null),
  ('ci-c-navy', 'color', 10, 'Deep Navy', '배경', null, null, '[]', '#05060D'),
  ('ci-c-sky', 'color', 11, 'Sound Sky', '그라데이션 시작', null, null, '[]', '#7FA8FF'),
  ('ci-c-violet', 'color', 12, 'Signal Violet', '그라데이션 중간', null, null, '[]', '#A46BFF'),
  ('ci-c-pink', 'color', 13, 'Pulse Pink', '강조색', null, null, '[]', '#F45FC8')
on conflict (id) do nothing;

-- ───────── 관리자 등록 ─────────
-- 아래 이메일을 관리자로 쓸 주소로 바꾼 뒤 실행한다.
-- 같은 주소로 Authentication > Users > Add user에서 계정을 만들어야 로그인할 수 있다.
-- insert into public.admins (email) values ('관리자이메일@회사.com') on conflict do nothing;
