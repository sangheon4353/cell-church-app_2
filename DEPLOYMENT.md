# 셀모임 앱 배포 가이드

## 개요
이 프로젝트는 **Expo 기반 React Native 웹앱**으로, Vercel에 배포할 수 있습니다.

---

## 1️⃣ Vercel 배포 (자동 배포)

### 1.1 사전 준비
- GitHub 계정 (리포지토리 필요)
- Vercel 계정 (https://vercel.com)

### 1.2 배포 단계

#### Step 1: GitHub에 푸시
```bash
git add .
git commit -m "Deploy: Vercel 배포 설정 추가"
git push origin main
```

#### Step 2: Vercel 연결
1. https://vercel.com/new 방문
2. GitHub 리포지토리 선택
3. 프로젝트 이름 입력
4. 환경변수 설정 (아래 참고)
5. Deploy 클릭

#### Step 3: 환경변수 설정
Vercel 대시보드 → Settings → Environment Variables에서 추가:

```
DATABASE_URL=your_database_url
NODE_ENV=production
```

### 1.3 자동 배포 활성화
- GitHub에 `main` 브랜치로 푸시하면 자동으로 Vercel에 배포됨
- Pull Request 생성 시 Preview URL 자동 생성

---

## 2️⃣ GitHub Actions 자동 배포

### 2.1 GitHub Secrets 설정
GitHub 리포지토리 → Settings → Secrets and variables → Actions에서 추가:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

**토큰 얻는 방법:**
1. Vercel 계정 → Settings → Tokens
2. Create Token 클릭
3. 토큰 복사 후 GitHub Secrets에 `VERCEL_TOKEN`으로 추가

**조직 ID 및 프로젝트 ID:**
1. Vercel 프로젝트 페이지 열기
2. Settings → General
3. `projectId`와 `teamId` 확인

### 2.2 워크플로우 확인
`.github/workflows/deploy.yml`이 자동으로 실행됩니다.

---

## 3️⃣ 로컬 빌드 테스트

배포 전에 로컬에서 빌드 테스트:

```bash
# 웹 빌드
pnpm build

# 빌드 결과 확인
ls -la dist/web/

# 로컬 서버에서 테스트 (선택사항)
pnpm start
```

---

## 4️⃣ 배포 후 확인

### 4.1 Vercel 대시보드
- https://vercel.com/dashboard
- 프로젝트 선택 → Deployments 탭
- 최신 배포 상태 확인

### 4.2 배포된 앱 접속
- Vercel에서 할당한 도메인 (예: `cellchurch-abc123.vercel.app`)
- 또는 커스텀 도메인 설정 가능

### 4.3 문제 해결
- **빌드 실패**: Vercel 대시보드 → Deployments → 실패한 배포 → Logs 확인
- **환경변수 누락**: Settings → Environment Variables 확인
- **DB 연결 오류**: DATABASE_URL 환경변수 확인

---

## 5️⃣ 커스텀 도메인 설정 (선택사항)

1. Vercel 프로젝트 → Settings → Domains
2. Add Domain 클릭
3. 도메인 입력 (예: `cellchurch.com`)
4. DNS 설정 (도메인 제공자에서 진행)

---

## 📋 체크리스트

배포 전 확인사항:

- [ ] `package.json`의 `build` 스크립트 확인
- [ ] `vercel.json` 설정 확인
- [ ] `.env.example` 작성 완료
- [ ] GitHub 리포지토리 생성 및 푸시
- [ ] Vercel 계정 생성
- [ ] 환경변수 설정 완료
- [ ] 로컬 빌드 테스트 성공
- [ ] GitHub Actions Secrets 설정 완료

---

## 🚀 빠른 배포 명령어

```bash
# 1. 로컬 빌드 테스트
pnpm build

# 2. GitHub 푸시
git add .
git commit -m "Deploy: Ready for Vercel"
git push origin main

# 3. Vercel 대시보드에서 배포 확인
# https://vercel.com/dashboard
```

---

## 📞 지원

문제가 발생하면:
1. Vercel 로그 확인: https://vercel.com/docs/concepts/deployments/logs
2. Expo 문서: https://docs.expo.dev/build/web/
3. GitHub Actions 로그: GitHub 리포지토리 → Actions 탭
