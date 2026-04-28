#!/bin/bash
set -e

echo "🔨 Building Expo web app..."

# 1. DB 마이그레이션 (필요시)
echo "📦 Running database migrations..."
pnpm db:push || echo "⚠️  DB migration skipped (may not be needed for web-only build)"

# 2. Expo 웹 빌드
echo "🏗️  Building Expo web..."
pnpm exec expo export --platform web

# 3. 빌드 결과 확인
if [ -d "dist/web" ]; then
  echo "✅ Build successful!"
  ls -lh dist/web/
else
  echo "❌ Build failed: dist/web not found"
  exit 1
fi
