-- ① 방명록 테이블
create table guestbook (
  id          bigserial primary key,
  name        text not null,
  text        text not null,
  font_idx    int  not null default 0,
  accent_idx  int  not null default 0,
  created_at  timestamptz default now()
);
alter table guestbook enable row level security;
create policy "누구나 읽기 가능"  on guestbook for select using (true);
create policy "누구나 쓰기 가능"  on guestbook for insert with check (true);

-- ② RSVP 테이블
create table rsvp (
  id          bigserial primary key,
  name        text not null,
  attending   text not null check (attending in ('yes','no')),
  guests      int  not null default 1,
  message     text,
  created_at  timestamptz default now()
);
alter table rsvp enable row level security;
create policy "누구나 쓰기 가능"  on rsvp for insert with check (true);

-- ③ 웨딩 스냅 테이블
create table wedding_snaps (
  id             bigserial primary key,
  uploader_name  text not null,
  image_url      text not null,
  created_at     timestamptz default now()
);
alter table wedding_snaps enable row level security;
create policy "누구나 읽기 가능"  on wedding_snaps for select using (true);
create policy "누구나 쓰기 가능"  on wedding_snaps for insert with check (true);

-- ④ Storage 버킷 생성 (Storage > New bucket 에서 직접 만들어도 됩니다)
-- 버킷 이름: wedding-snaps  /  Public: ON
