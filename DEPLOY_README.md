# 🚀 빠른 배포 가이드

## Vercel 배포 (가장 쉬운 방법)

### 1단계: GitHub에 푸시
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2단계: Vercel 연결
1. https://vercel.com/new 방문
2. GitHub 리포지토리 선택
3. "Deploy" 클릭

**끝!** 자동으로 배포됩니다.

---

## 🔧 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 추가하세요:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | 데이터베이스 연결 문자열 |
| `NODE_ENV` | `production` | 프로덕션 환경 |

---

## 📊 배포 후 확인

- Vercel 대시보드: https://vercel.com/dashboard
- 배포된 앱: `https://your-project.vercel.app`
- 자동 배포: GitHub에 푸시하면 자동 배포됨

---

## ❓ 자주 묻는 질문

**Q: 커스텀 도메인을 사용하고 싶어요.**
A: Vercel 프로젝트 → Settings → Domains에서 추가 가능합니다.

**Q: 빌드가 실패했어요.**
A: Vercel 대시보드 → Deployments → 실패한 배포 → Logs에서 오류 확인하세요.

**Q: 환경변수를 어떻게 추가하나요?**
A: Vercel 프로젝트 → Settings → Environment Variables에서 추가하세요.

---

자세한 내용은 `DEPLOYMENT.md`를 참고하세요.
