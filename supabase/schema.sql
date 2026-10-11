-- =====================================================================
-- HELLOOOO · Supabase 초기 설정
-- 사용법: Supabase 대시보드 → SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
-- 여러 번 실행해도 안전하도록 작성했습니다.
-- =====================================================================

-- 1) 회원 프로필 ------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nickname    text not null,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: 누구나 조회" on public.profiles;
create policy "profiles: 누구나 조회" on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists "profiles: 본인만 수정" on public.profiles;
create policy "profiles: 본인만 수정" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- 회원이 자기 role(관리자 권한)을 바꾸지 못하도록 수정 가능한 칸을 제한
revoke update on public.profiles from authenticated;
grant update (nickname, avatar_url) on public.profiles to authenticated;

-- 회원가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'nickname', ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) 영상 -------------------------------------------------------------
create table if not exists public.videos (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 60),
  description  text check (char_length(description) <= 500),
  tags         text[] not null default '{}',
  video_path   text not null,
  poster_path  text,
  duration     real,
  tradable     boolean not null default false,
  price        bigint check (price is null or price >= 0),
  -- 지금은 올리면 바로 공개(published). 관리자 검수를 도입하면 기본값을 'pending'으로 바꿉니다.
  status       text not null default 'published' check (status in ('pending', 'published', 'rejected')),
  views        bigint not null default 0,
  likes        bigint not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists videos_status_created_idx on public.videos (status, created_at desc);
create index if not exists videos_owner_idx on public.videos (owner_id);

alter table public.videos enable row level security;

drop policy if exists "videos: 공개 영상 또는 내 영상 조회" on public.videos;
create policy "videos: 공개 영상 또는 내 영상 조회" on public.videos
  for select to anon, authenticated
  using (status = 'published' or owner_id = auth.uid());

drop policy if exists "videos: 본인 명의로만 등록" on public.videos;
create policy "videos: 본인 명의로만 등록" on public.videos
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "videos: 본인만 수정" on public.videos;
create policy "videos: 본인만 수정" on public.videos
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "videos: 본인만 삭제" on public.videos;
create policy "videos: 본인만 삭제" on public.videos
  for delete to authenticated using (owner_id = auth.uid());

-- 회원은 제목·설명·태그·거래 설정만 수정 가능 (status, 조회수, 좋아요는 수정 불가)
revoke update on public.videos from authenticated;
grant update (title, description, tags, tradable, price) on public.videos to authenticated;

-- 3) 파일 저장소 (영상 + 썸네일) ---------------------------------------
-- 무료 요금제의 파일당 최대 크기에 맞춰 50MB로 제한
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800,
        array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 파일 경로는 "회원ID/파일이름" 형식. 자기 폴더에만 올리고 지울 수 있음
drop policy if exists "storage: 내 폴더에 업로드" on storage.objects;
create policy "storage: 내 폴더에 업로드" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "storage: 내 파일 삭제" on storage.objects;
create policy "storage: 내 파일 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
