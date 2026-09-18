import { choice, TypeSafeClient } from "@typesafe-ai/sdk";
import { COUNTRIES, type CountryCode } from "../src/countries.ts";

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

export async function predictAge(name: string, country: CountryCode) {
  client ??= new TypeSafeClient();
  const { english, hint } = COUNTRIES[country];
  const year = new Date().getFullYear();
  const { answers } = await client.systemOne({
    state: {
      task: `Estimate the likely birth generation of a person in ${english} from their given name alone, based on that country's naming trends by era (e.g. ${hint}).`,
      country: english,
      name,
    },
    questions: {
      age: choice(
        `Which age group is a person in ${english} with this name most likely to be in as of ${year}?`,
        ageBands(year),
      ),
      gender: choice(`Which gender is this name most commonly given to in ${english}?`, GENDERS),
    },
  });
  return answers;
}

export type Prediction = Awaited<ReturnType<typeof predictAge>>;
