export const BANDS = [
  { key: "10대 이하", emoji: "🍭", color: "#ff4fa0", tagline: "톡톡 튀는 새싹" },
  { key: "20대", emoji: "🎧", color: "#ff7a2f", tagline: "청춘 그 자체" },
  { key: "30대", emoji: "☕", color: "#f5b700", tagline: "커리어 풀가동" },
  { key: "40대", emoji: "🌿", color: "#16c47f", tagline: "인생 중반 황금기" },
  { key: "50대", emoji: "🌊", color: "#2d9cff", tagline: "여유 한 스푼" },
  { key: "60대", emoji: "🎻", color: "#6c5cff", tagline: "멋이 익어가는 중" },
  { key: "70대 이상", emoji: "🍵", color: "#b44dff", tagline: "인생 베테랑" },
] as const;

export type Band = (typeof BANDS)[number];

export const bandOf = (key: string): Band => BANDS.find((b) => b.key === key) ?? BANDS[0];
