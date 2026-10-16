// 임시 목업 데이터입니다. API가 준비되면 이 파일 대신 fetch 결과로 교체하세요.
// 이미지: picsum.photos 시드 이미지(개발용 플레이스홀더). 실제 썸네일 URL로 바꾸면 됩니다.
export const img = (seed, w = 400, h = 520) =>
  `https://picsum.photos/seed/hello-${seed}/${w}/${h}`

// 영상 파일: public/videos/ 폴더에 넣은 mp4를 가리킵니다. (예: public/videos/a.mp4 → /videos/a.mp4)
// 썸네일(poster)을 따로 만들었다면 같은 폴더에 a.jpg 등으로 넣고 poster: '/videos/a.jpg' 를 추가하세요.
export const vid = (name) => `/videos/${name}.mp4`

// WATCH 상단 배너에 번갈아 나올 영상 (watchItems의 id)
// 배너 전용 영상을 쓰려면 public/videos/banner.mp4 를 넣고 아래를 ['banner'] 로 바꾸세요.
export const bannerVideoIds = ['w1', 'w6', 'w7']

export const currentUser = {
  name: 'J STORY',
  avatar: img('me', 120, 120),
}

export const watchItems = [
  { id: 'w1', owner: 'happy_pet', price: 2800000, description: '바다를 처음 본 골든리트리버의 하루. 파도와 공놀이에 빠진 30초입니다.', createdAt: '2026-09-02', video: vid('a'), rank: 1, title: '오늘도 좋은 하루', tags: ['강아지', '힐링'], duration: '0:32', views: '1.2M', likes: '84K', tradable: true, seed: 'dog' },
  { id: 'w2', owner: 'film_k', price: 7000000, description: '비 내린 뒤 도심의 네온 불빛을 따라 걷는 시네마틱 브이로그.', createdAt: '2026-08-21', video: vid('b'), rank: 2, title: '도시의 밤', tags: ['브이로그', '일상'], duration: '0:45', views: '980K', likes: '72K', tradable: true, seed: 'night' },
  { id: 'w3', owner: 'wave_rider', description: '실패한 열두 번의 테이크 끝에 잡은 단 한 번의 파도.', createdAt: '2026-08-11', video: vid('c'), rank: 3, title: '다시, 도전', tags: ['스포츠', '열정'], duration: '0:28', views: '850K', likes: '68K', tradable: false, seed: 'surf' },
  { id: 'w4', owner: 'cafe_day', price: 1900000, description: '라떼 아트가 완성되는 순간을 클로즈업으로 담았습니다.', createdAt: '2026-09-28', video: vid('d'), badge: 'new', title: '커피 한 잔의 시간', tags: ['카페', '감성'], duration: '0:31', views: '320K', likes: '24K', tradable: true, seed: 'coffee' },
  { id: 'w5', owner: 'suyeon_', description: '해 질 녘 옥상에서 바라본 도시. 하루가 끝나는 색을 기록했습니다.', createdAt: '2026-09-30', video: vid('e'), badge: 'new', title: '노을이 머무는 곳', tags: ['여행', '풍경'], duration: '0:37', views: '410K', likes: '31K', tradable: false, seed: 'sunset' },
  { id: 'w6', owner: 'meow_lab', price: 4500000, description: '나비를 처음 본 아기 고양이의 표정 변화.', createdAt: '2026-09-15', video: vid('f'), badge: 'hot', title: '작은 행복', tags: ['고양이', '일상'], duration: '0:26', views: '2.3M', likes: '120K', tradable: true, seed: 'cat' },
  { id: 'w7', owner: 'dance_mira', price: 3200000, description: '빈 연습실, 아침 햇살 속에서 한 번에 춘 즉흥 댄스.', createdAt: '2026-10-03', video: vid('g'), badge: 'new', title: '춤추는 순간', tags: ['댄스', '도전'], duration: '0:40', views: '560K', likes: '48K', tradable: true, seed: 'dance' },
  { id: 'w8', owner: 'camp_life', description: '은하수 아래 텐트 하나. 타임랩스로 담은 밤하늘.', createdAt: '2026-07-30', video: vid('a'), title: '별이 빛나는 밤', tags: ['캠핑', '자연'], duration: '0:35', views: '780K', likes: '62K', tradable: false, seed: 'stars' },
  { id: 'w9', owner: 'jino_park', price: 5000000, description: '노을 진 공원에서 성공한 킥플립, 그 한 번을 위한 기록.', createdAt: '2026-09-09', video: vid('b'), badge: 'hot', title: '한 번 더', tags: ['스케이트보드', '열정'], duration: '0:33', views: '1.8M', likes: '95K', tradable: true, seed: 'skate' },
]

export const tradeItems = [
  { id: 't1', video: vid('a'), badge: 'new', title: '노을이 머무는 곳', tags: ['감성', '여행', '일상'], owner: 'suyeon_', price: 3500000, likes: '1.2K', duration: '0:33', sold: false, seed: 'sunset-girl' },
  { id: 't2', video: vid('b'), badge: 'hot', title: '한 번 더', tags: ['스케이트보드', '도전'], owner: 'jino_park', price: 5000000, likes: '2.8K', duration: '0:27', sold: false, seed: 'skate' },
  { id: 't3', video: vid('c'), title: '오늘도 좋은 하루', tags: ['강아지', '힐링'], owner: 'happy_pet', price: 2800000, likes: '980', duration: '0:22', sold: false, seed: 'dog' },
  { id: 't4', video: vid('d'), title: '도시의 밤', tags: ['시네마틱', '도시'], owner: 'film_k', price: 7000000, likes: '4.1K', duration: '0:31', sold: false, seed: 'city-rain' },
  { id: 't5', video: vid('e'), title: '푸른 숨', tags: ['바다', '자연'], owner: 'ocean_', price: 4600000, likes: '6.2K', duration: '0:28', sold: true, seed: 'ocean' },
  { id: 't6', video: vid('f'), title: '커피 한 잔의 시간', tags: ['카페', '감성'], owner: 'cafe_day', price: 1900000, likes: '3.1K', duration: '0:24', sold: true, seed: 'coffee' },
  { id: 't7', video: vid('g'), title: '봄, 그리고 너', tags: ['봄', '감성', '연애'], owner: 'bom_', price: 4200000, likes: '2.4K', duration: '0:26', sold: false, seed: 'blossom' },
  { id: 't8', video: vid('a'), title: '별이 빛나는 밤', tags: ['캠핑', '자연'], owner: 'camp_life', price: 3900000, likes: '3.7K', duration: '0:30', sold: false, seed: 'stars' },
  { id: 't9', video: vid('b'), title: 'Another Me', tags: ['애니메이션', 'AI'], owner: 'ai_studio', price: 6500000, likes: '5.8K', duration: '0:29', sold: false, seed: 'headphones' },
]

export const myProjects = [
  { id: 'p1', title: '도시의 밤', status: 'planning', date: '2026.09.10', seed: 'night' },
  { id: 'p2', title: '별이 빛나는 날', status: 'producing', date: '2026.09.05', seed: 'stars' },
  { id: 'p3', title: '다시, 도전', status: 'published', date: '2026.08.28', views: '1.2M', likes: '84K', seed: 'surf' },
  { id: 'p4', title: '작은 행복', status: 'planning', date: '2026.08.20', seed: 'dog' },
]

export const projectStatus = {
  planning: { label: '기획중', tone: 'violet' },
  producing: { label: '제작중', tone: 'amber' },
  published: { label: '공개됨', tone: 'green' },
}

export const fundProjects = [
  {
    id: 'another-me',
    vip: true,
    title: 'Another Me',
    tagline: '평범한 오늘,\n또 다른 내가 시작된다',
    tags: ['드라마', '성장', '청춘', 'AI'],
    planner: 'J STORY',
    summary: "잊고 지낸 '나'를 다시 만나는 이야기.\n지금, 함께 만들어주세요.",
    goal: 1000000000,
    raised: 620000000,
    daysLeft: 12,
    likes: '12.4K',
    seed: 'another-me',
    gallery: ['another-me', 'city-dusk', 'rooftop'],
  },
  { id: 'astronaut', title: '마지막 궤도', percent: 42, seed: 'astro' },
  { id: 'walk-home', title: '집으로 가는 길', percent: 91, seed: 'walk' },
  { id: 'neon-dance', title: '네온 스텝', percent: 28, seed: 'neon' },
]

export const trendingSeeds = ['castle', 'cat', 'ocean', 'headphones', 'car', 'moon']

export const formatKRW = (n) => '₩ ' + n.toLocaleString('ko-KR')
