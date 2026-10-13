-- 게시판 글을 언어별로 따로 쓰기 위한 언어 칸
-- 기존 글은 모두 한국어(ko)로 둔다
alter table public.notices  add column if not exists lang text not null default 'ko' check (lang in ('ko', 'en', 'ja', 'de'));
alter table public.news     add column if not exists lang text not null default 'ko' check (lang in ('ko', 'en', 'ja', 'de'));
alter table public.ci_items add column if not exists lang text not null default 'ko' check (lang in ('ko', 'en', 'ja', 'de'));

create index if not exists notices_lang_idx  on public.notices (lang);
create index if not exists news_lang_idx     on public.news (lang);
create index if not exists ci_items_lang_idx on public.ci_items (lang);
