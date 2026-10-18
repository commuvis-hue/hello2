# HELLOOOO · Shorts to the World

디자인 초안(랜딩 / WATCH / CREATE / FUND / FUND 상세 / TRADE)을 구현한 Vite + React 프로젝트입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 생성
```

## Vercel 배포

1. GitHub 저장소에 push
2. Vercel → Add New → Project → 저장소 Import (Framework: Vite 자동 인식)
3. 이후 push마다 자동 배포. `vercel.json`이 SPA 새로고침 404를 방지합니다.

## 회원가입 · 영상 업로드 설정 (Supabase)

업로드와 로그인은 Supabase를 사용합니다. 설정 전에도 사이트는 정상 동작하며, 로그인·업로드 화면에 설정 안내가 표시됩니다.

1. https://supabase.com 가입 → **New project** (Region: Northeast Asia (Seoul) 권장, DB 비밀번호는 따로 보관)
2. 왼쪽 메뉴 **SQL Editor** → New query → `supabase/schema.sql` 전체를 붙여넣고 **Run**
3. **Project Settings → API** (또는 상단 **Connect**)에서 Project URL과 anon(publishable) 키 복사
4. Vercel → 프로젝트 → **Settings → Environment Variables**에 추가 후 **Deployments → Redeploy**
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon(publishable) 키
5. Supabase → **Authentication → URL Configuration**
   - Site URL: `https://내프로젝트.vercel.app`
   - Redirect URLs: `https://내프로젝트.vercel.app/**`
   (이 설정을 안 하면 가입 인증 메일 링크가 localhost로 연결됩니다)

로컬에서 개발할 때는 `.env.example`을 `.env.local`로 복사해 같은 값을 넣으세요. `.env.local`은 GitHub에 올라가지 않습니다.

관리자 지정: Supabase → Table Editor → `profiles`에서 해당 회원의 `role`을 `admin`으로 변경 (관리자 페이지는 다음 단계에서 추가 예정)

## 다국어 (한국어 · English · 简体中文)

- 상단 🌐 버튼으로 언어를 바꿀 수 있고, 기본값은 한국어입니다. 선택한 언어는 브라우저에 저장되어 다음 방문에도 유지됩니다.
- 화면 문구는 소스에서 `t('한국어 문장')` 형태로 쓰여 있고, 이 한국어 문장이 그대로 번역 키입니다.
- 번역 수정: `src/i18n/en.js`, `src/i18n/zh.js`에서 해당 한국어 문장을 찾아 오른쪽 값을 고치면 됩니다.
- 새 문구 추가: 화면에 `t('새 문장')`을 쓰고, en.js / zh.js에 `"새 문장": "번역"` 한 줄씩 추가합니다. 번역이 없으면 한국어 원문이 그대로 표시됩니다.
- `{title}`, `{amount}` 같은 중괄호는 값이 들어갈 자리이므로 번역문에서도 그대로 두세요.
- 회원이 올린 영상 제목·설명·태그 같은 콘텐츠는 번역하지 않고 작성된 언어 그대로 보여줍니다.

## 라우트

| 경로 | 화면 |
|---|---|
| `/` | 랜딩 (WATCH·CREATE·FUND·TRADE 소개) |
| `/watch` | 쇼츠 목록, 전체/인기/신규/조회수 필터 |
| `/create` | 시놉시스·업로드·도구, 내 프로젝트 상태 필터 |
| `/fund` | 펀딩 메인, 추천 프로젝트, 트렌딩 |
| `/fund/:id` | VIP 펀딩 상세·투자 (라이트 테마) |
| `/trade` | 커버플로우 배너, 거래 상품 필터 |
| `/login` | 로그인 · 회원가입 |
| `/synopsis/new`, `/synopsis/:id` | 시놉시스 작성·수정, 자동 저장 (로그인 필요) |
| `/purchase/:list/:id` | 영상 거래: 소유권 고지 → 결제 방식 → 결제(테스트) → 저작권 인증서 (로그인 필요) |
| `/verify`, `/certificate/:code` | 인증서 진위 확인 (누구나) |
| `/upload` | 영상 업로드 (로그인 필요) |
| `/my` | 마이페이지 · 내가 올린 영상 관리 (로그인 필요) |
| `/play/:list/:id` | 쇼츠 세로 재생 화면 |
| `/library` | 준비 중 화면 |

## 구조

```
src/
  App.jsx               라우팅
  index.css             디자인 토큰 + 전체 스타일
  data/mock.js          목업 데이터 (API 연동 시 교체)
  components/           Header, BottomNav, Logo, Chips, Badge, Script, AppLayout
  pages/                Landing, Watch, Create, Fund, FundDetail, Trade, Placeholder
```

## 다음 단계로 바꿀 부분

- 이미지: `mock.js`의 `img()`가 picsum.photos 플레이스홀더를 반환합니다. 실제 썸네일 URL 또는 `public/` 이미지로 교체하세요.
- 데이터: `mock.js`를 API 호출(React Query 등)로 교체하세요.
- 결제: `FundDetail.jsx`의 "즉시 투자하기"는 현재 완료 모달만 띄웁니다. PG 연동(토스페이먼츠, 포트원 등)은 서버(Vercel Functions `/api`)에서 처리하세요.
