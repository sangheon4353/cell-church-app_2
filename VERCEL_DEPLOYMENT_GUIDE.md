# 🚀 Vercel 배포 완벽 가이드

## 📋 목차
1. [사전 준비](#사전-준비)
2. [Step 1: GitHub 리포지토리 생성](#step-1-github-리포지토리-생성)
3. [Step 2: Vercel 계정 생성](#step-2-vercel-계정-생성)
4. [Step 3: Vercel에 배포](#step-3-vercel에-배포)
5. [Step 4: 환경변수 설정](#step-4-환경변수-설정)
6. [Step 5: 배포 확인](#step-5-배포-확인)

---

## 사전 준비

필요한 것:
- ✅ GitHub 계정 (https://github.com)
- ✅ Vercel 계정 (https://vercel.com)
- ✅ 이 프로젝트 코드

---

## Step 1: GitHub 리포지토리 생성

### 1.1 GitHub에서 새 리포지토리 생성

1. https://github.com/new 방문
2. 리포지토리 이름 입력: `cell-church-app`
3. 설명 입력: `교회 셀 모임 앱`
4. **Public** 선택 (Vercel 무료 배포 가능)
5. "Create repository" 클릭

### 1.2 로컬에서 코드 푸시

터미널에서 다음 명령어 실행:

```bash
# 프로젝트 디렉토리로 이동
cd /home/ubuntu/cell-church-app

# Git 초기화 (이미 되어있으면 스킵)
git init

# 원격 저장소 추가 (YOUR_USERNAME을 자신의 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/cell-church-app.git

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Cell church app with Vercel deployment setup"

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

**예시:**
```bash
git remote add origin https://github.com/john-doe/cell-church-app.git
git push -u origin main
```

---

## Step 2: Vercel 계정 생성

1. https://vercel.com/signup 방문
2. GitHub으로 로그인 선택
3. GitHub 계정 연결 (자동으로 진행)
4. 계정 생성 완료

---

## Step 3: Vercel에 배포

### 3.1 Vercel에서 프로젝트 추가

1. https://vercel.com/dashboard 방문
2. "Add New..." → "Project" 클릭
3. GitHub 리포지토리 선택: `cell-church-app`
4. "Import" 클릭

### 3.2 프로젝트 설정

**프로젝트 이름:** `cell-church-app` (자동 입력)

**Framework Preset:** `Other` (Expo는 자동 감지 안 됨)

**Build Command:** 
```
pnpm build
```

**Output Directory:** 
```
dist/web
```

**Install Command:** 
```
pnpm install
```

이미 설정되어 있으면 그대로 진행하세요.

### 3.3 배포 시작

1. "Deploy" 버튼 클릭
2. 배포 시작 (약 2-5분 소요)
3. 배포 완료 대기

---

## Step 4: 환경변수 설정

### 4.1 환경변수 추가

배포 후 Vercel 대시보드에서:

1. 프로젝트 선택
2. "Settings" 탭 클릭
3. "Environment Variables" 클릭
4. 다음 환경변수 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://user:password@host:5432/dbname` | 데이터베이스 연결 문자열 |
| `NODE_ENV` | `production` | 프로덕션 환경 |

**DATABASE_URL 예시:**
```
postgresql://postgres:mypassword@db.example.com:5432/cellchurch
```

### 4.2 환경변수 적용

1. 각 환경변수 추가 후 "Save" 클릭
2. "Deployments" 탭으로 이동
3. 최신 배포 선택
4. "Redeploy" 클릭 (환경변수 적용)

---

## Step 5: 배포 확인

### 5.1 배포 상태 확인

Vercel 대시보드에서:
- ✅ **Deployments** 탭: 배포 상태 확인
- ✅ 초록색 체크 표시: 배포 성공
- ✅ 빨간색 X 표시: 배포 실패 (로그 확인)

### 5.2 배포된 앱 접속

배포 성공 후:
1. Vercel에서 할당한 도메인 확인 (예: `cell-church-app-abc123.vercel.app`)
2. 브라우저에서 접속
3. 앱이 정상 작동하는지 확인

### 5.3 로그 확인

배포 실패 시:
1. Vercel 대시보드 → Deployments
2. 실패한 배포 클릭
3. "Logs" 탭에서 오류 메시지 확인

---

## 🔄 자동 배포 설정

### 6.1 자동 배포 활성화

이제부터 GitHub에 푸시하면 자동으로 Vercel에 배포됩니다:

```bash
# 로컬에서 코드 수정 후
git add .
git commit -m "Update: 새로운 기능 추가"
git push origin main

# Vercel이 자동으로 배포 시작
# 약 2-5분 후 배포 완료
```

### 6.2 배포 상태 확인

GitHub 리포지토리에서:
- Pull Request 생성 시 Preview URL 자동 생성
- 커밋 옆에 Vercel 배포 상태 표시

---

## 💡 팁과 트러블슈팅

### Q: 배포 실패했어요
**A:** Vercel 대시보드 → Deployments → 실패한 배포 → Logs에서 오류 확인

### Q: 환경변수가 적용 안 됐어요
**A:** Settings → Environment Variables에서 변수 추가 후 "Redeploy" 클릭

### Q: 데이터베이스 연결이 안 돼요
**A:** DATABASE_URL이 올바른지 확인. 방화벽 설정 확인 필요

### Q: 커스텀 도메인을 사용하고 싶어요
**A:** Settings → Domains에서 도메인 추가 (DNS 설정 필요)

### Q: 배포 후 이전 버전으로 돌아가고 싶어요
**A:** Deployments 탭에서 이전 배포 선택 → "Promote to Production" 클릭

---

## 📊 배포 후 모니터링

### 성능 확인
- Vercel 대시보드 → Analytics
- 방문자 수, 로딩 시간, 에러율 확인

### 로그 확인
- Vercel 대시보드 → Logs
- 실시간 서버 로그 확인

---

## 🎉 완료!

축하합니다! 이제 웹앱이 Vercel에 배포되었습니다.

**배포된 앱 URL:** `https://cell-church-app-xxx.vercel.app`

**다음 단계:**
1. 앱이 정상 작동하는지 테스트
2. 필요시 커스텀 도메인 설정
3. 모니터링 설정 (Analytics, Logs)

---

## 📞 도움말

문제가 있으면:
1. Vercel 문서: https://vercel.com/docs
2. Expo 웹 배포: https://docs.expo.dev/build/web/
3. GitHub Issues: 프로젝트 리포지토리에서 이슈 생성
