import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

/** Birth-year ranges are derived from the current year so the bands never go stale. */
function ageBands(year: number) {
  const born = (decade: number) => `Born roughly ${year - decade - 9}–${year - decade}`;
  return {
    "10대 이하": `Born in ${year - 19} or later, a child or teenager (under 20)`,
    "20대": `${born(20)}, in their twenties`,
    "30대": `${born(30)}, in their thirties`,
    "40대": `${born(40)}, in their forties`,
    "50대": `${born(50)}, in their fifties`,
    "60대": `${born(60)}, in their sixties`,
    "70대 이상": `Born in ${year - 70} or earlier, seventy or older`,
  };
}

const GENDERS = {
  남성: "The name is typically given to boys",
  여성: "The name is typically given to girls",
} as const;

let client: TypeSafeClient | undefined;

export async function predictAge(name: string) {
  client ??= new TypeSafeClient();
  const year = new Date().getFullYear();
  const { answers } = await client.systemOne({
    state: {
      task: "Estimate the likely birth generation of a person in South Korea from their name alone, based on naming trends by era (e.g. 영수/순자 are older names, 서준/서윤 are recent names).",
      name,
    },
    questions: {
      age: choice(
        `Which age group is a Korean person with this name most likely to be in as of ${year}?`,
        ageBands(year),
      ),
      gender: choice("Which gender is this Korean name most commonly given to?", GENDERS),
    },
  });
  return answers;
}

export type Prediction = Awaited<ReturnType<typeof predictAge>>;
