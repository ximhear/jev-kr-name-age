/** Per-country settings shared by the UI and the server-side Jev prompt. */
export const COUNTRIES = {
  kr: {
    label: "한국",
    flag: "🇰🇷",
    english: "South Korea",
    // Older vs. recent given names, to anchor the model on this country's naming eras.
    hint: "영수/순자 are older names, 서준/서윤 are recent names",
    pattern: /^[가-힣]{1,5}$/,
    maxLength: 5,
    invalid: "한글 이름을 1~5자로 입력해 주세요.",
    placeholder: "이름을 입력해 주세요",
    examples: ["서준", "지혜", "영수", "민지", "순자", "현우", "하린", "말자"],
  },
  us: {
    label: "미국",
    flag: "🇺🇸",
    english: "the United States",
    hint: "Dorothy/Gary/Linda are older names, Liam/Harper/Aiden are recent names",
    pattern: /^[A-Za-z][A-Za-z' -]{0,29}$/,
    maxLength: 30,
    invalid: "영문 이름을 입력해 주세요. (예: Liam)",
    placeholder: "영문 이름 (예: Liam)",
    examples: ["Liam", "Jessica", "Gary", "Ashley", "Dorothy", "Jason", "Harper", "Mildred"],
  },
  jp: {
    label: "일본",
    flag: "🇯🇵",
    english: "Japan",
    hint: "和子/清/節子 are older names, 陽翔/陽葵/蓮 are recent names",
    pattern: /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]{1,10}$/u,
    maxLength: 10,
    invalid: "일본어(한자·히라가나·가타카나) 이름을 입력해 주세요.",
    placeholder: "일본 이름 (예: 陽翔, さくら)",
    examples: ["陽翔", "美香", "清", "さくら", "和子", "翔太", "陽葵", "節子"],
  },
  cn: {
    label: "중국",
    flag: "🇨🇳",
    english: "mainland China",
    hint: "建国/秀英/淑珍 are older names, 子轩/梓涵/欣怡 are recent names",
    pattern: /^\p{Script=Han}{1,4}$/u,
    maxLength: 4,
    invalid: "중국어 한자 이름(성 제외 1~4자)을 입력해 주세요.",
    placeholder: "중국 이름 (예: 子轩)",
    examples: ["子轩", "丽娟", "建国", "欣怡", "秀英", "伟", "梓涵", "淑珍"],
  },
} as const;

export type CountryCode = keyof typeof COUNTRIES;

export const isCountry = (code: string | null): code is CountryCode => !!code && code in COUNTRIES;
