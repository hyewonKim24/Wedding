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

-- ④ Storage 정책 (버킷은 대시보드에서 Public ON으로 생성 후 아래 실행)
insert into storage.buckets (id, name, public) values ('wedding-snaps', 'wedding-snaps', true)
  on conflict (id) do update set public = true;

create policy "누구나 업로드 가능" on storage.objects
  for insert with check (bucket_id = 'wedding-snaps');

create policy "누구나 읽기 가능" on storage.objects
  for select using (bucket_id = 'wedding-snaps');
