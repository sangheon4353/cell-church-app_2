/** @type {const} */
const themeColors = {
  primary: { light: '#5B9BD5', dark: '#7BB3E8' },        // 하늘색 (주요 액션)
  background: { light: '#FAF8F5', dark: '#1A1A1F' },     // 따뜻한 베이지 배경
  surface: { light: '#FFFFFF', dark: '#25252C' },         // 카드/모달 배경
  foreground: { light: '#2D2D35', dark: '#EEEEF2' },     // 주요 텍스트
  muted: { light: '#8A8A9A', dark: '#9A9AAA' },           // 보조 텍스트
  border: { light: '#E8E4DC', dark: '#3A3A45' },          // 테두리/구분선
  accent: { light: '#E8F4FD', dark: '#1E3A52' },          // 강조 배경 (연한 하늘)
  success: { light: '#5BAD8F', dark: '#6DC4A3' },         // 완료/성공 (민트)
  warning: { light: '#E8A84C', dark: '#F0BC6A' },         // 경고 (따뜻한 노랑)
  error: { light: '#D96B6B', dark: '#E88080' },           // 오류 (부드러운 빨강)
};

module.exports = { themeColors };
