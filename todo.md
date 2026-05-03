# 셀 모임 앱 기능 확장 TODO

## [Phase 1] 기존 기능 보호 및 데이터 확장
- [x] 66권 성경 데이터 추가 (bibleBooks 테이블)
- [x] 복수 할당 DB 스키마 확장 (기존 단일 할당 유지)
- [x] 장 기반 기록 테이블 추가 (bibleChapterRecords)

## [Phase 2] 성경 쓰기 기능 확장
- [x] 복수 성경 선택 UI 추가 (기존 단일 선택 유지)
- [x] 장 입력 필드 추가 (절 필드 제거 - 장 기반 입력 화면)
- [x] 장 기반 진행률 계산 로직 추가
- [x] 성경별 진행률 상세 페이지 추가 (bible-chapter-input.tsx)
- [x] 입력 방식 선택 모달 추가 (절 기반 vs 장 기반)

## [Phase 3] 기도 기능 확장
- [x] 빠른 선택 버튼 이미 구현됨 (+1, +5, +10, +15, +30분)
- [x] 홈 화면 기도 시간 TOP 3 카드 추가

## [Phase 4] 회원가입 UX 개선
- [x] 생년월일 입력 방식 변경 (텍스트 → 휠 선택)
- [x] DateWheelPicker 컴포넌트 생성

## [Phase 5] 홈 화면 확장
- [x] 성경 쓰기 TOP 3 카드 추가
- [x] 기도 시간 TOP 3 카드 추가
- [x] 기존 레이아웃 유지하면서 자연스럽게 배치
- [x] TOP 3 DB 함수 구현 (getCellBibleTop3, getCellPrayerTop3)
- [x] TOP 3 tRPC 라우터 추가 (rankings.bibleTop3, rankings.prayerTop3)

## [Phase 6] 검증 및 배포
- [x] 기존 기능 모두 정상 동작 확인
- [x] 새 기능 모두 실제 동작 확인
- [x] TypeScript 오류 해결
- [x] 데이터 저장/수정 흐름 검증
- [ ] 최종 체크포인트 저장

## 구현 완료 기능 요약

### 1. 성경 쓰기 기능 확장 ✅
- **절 기반 입력** (기존): 책/장/절 입력 유지
- **장 기반 입력** (신규): 책/시작장/종료장 입력
- 입력 방식 선택 모달 UI
- 기존 기능 100% 보호

### 2. 회원가입 개선 ✅
- **텍스트 입력** → **휠 선택 방식** (년/월/일)
- DateWheelPicker 컴포넌트
- 직관적이고 터치 친화적

### 3. 홈 화면 확장 ✅
- **성경 쓰기 TOP 3**: 이번 주 가장 많이 작성한 셀원 3명
- **기도 TOP 3**: 이번 주 가장 많이 기도한 셀원 3명
- 격려와 동기부여 중심 (경쟁 강조 X)
- 기존 카드 레이아웃 유지

### 4. 데이터 구조 확장 ✅
- bibleBooks: 66권 성경 마스터 데이터
- bibleChapterRecords: 장 기반 성경 기록
- weeklyStats: 주간 통계 캐시
- getCellBibleTop3, getCellPrayerTop3: TOP 3 계산 함수

## 기존 기능 보호 상태 ✅
- ✅ 기존 성경 쓰기 절 기반 입력 유지
- ✅ 기존 기도 시간 입력 유지
- ✅ 기존 회원가입 프로세스 유지 (휠 선택 추가)
- ✅ 기존 홈 화면 카드 유지 (TOP 3 추가)
- ✅ 기존 셀 리더 기능 유지
- ✅ 기존 마이페이지 유지
- ✅ 기존 알림 기능 유지

## 변경 파일 목록
- app/(auth)/register.tsx: DateWheelPicker 적용
- app/(tabs)/bible.tsx: 입력 방식 선택 모달 추가
- app/(tabs)/index.tsx: TOP 3 카드 추가
- app/bible-chapter-input.tsx: 새로운 장 기반 입력 화면
- components/date-wheel-picker.tsx: 생년월일 휠 선택 컴포넌트
- drizzle/schema.ts: 새 테이블 추가 (bibleBooks, bibleChapterRecords, weeklyStats)
- server/db.ts: 새 쿼리 함수 추가
- server/routers.ts: bibleChapterRecord, rankings 라우터 추가

## 다음 단계 (선택사항)
- [ ] 오늘의 매일성경 범위 API 연동
- [ ] 셀 모임 일정/공지 기능 추가
- [ ] 성경 쓰기 연속 기록 뱃지 (streak) 추가
- [ ] 푸시 알림 세부 설정
- [ ] 사용자 피드백 기반 UI 개선

## [신규 요청 - 3가지 기능 추가]
- [ ] 홈 화면 "이번 주 성경 쓰기" 합산에 장 기반 기록 포함 (현재 절 기반만 집계됨)
- [ ] 장 기반 입력 화면: 시작/끝 장 입력칸 크기 축소 (한 화면에 표시)
- [ ] 큐티 여부 Y/N 체크 기능
  - [ ] DB 테이블 추가 (dailyDevotionLog)
  - [ ] tRPC 라우터 추가 (today, toggle, cellStatus)
  - [ ] 홈 화면 큐티 링크 박스 아래에 카드 추가
  - [ ] 셀 전체 Y/N 상세 화면 (누르면 확인 가능)
