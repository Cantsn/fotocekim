import { cookies } from "next/headers";
import { dictionaries, type Dictionary, type Locale } from "./dictionary";
import { LOCALE_COOKIE } from "./server-cookie";

export { LOCALE_COOKIE };

export async function getLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const v = store.get(LOCALE_COOKIE)?.value;
    return v === "en" ? "en" : "tr";
  } catch {
    return "tr";
  }
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale] as Dictionary;
}
