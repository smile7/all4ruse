import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;
  console.log("Route param locale:", locale);
  console.log("Cookie locale:", cookieLocale);
  const effectiveLocale = locale || cookieLocale || "en";
  console.log("Effective locale:", effectiveLocale);
  return {
    locale: effectiveLocale,
    messages: (await import(`./locales/${effectiveLocale}.json`)).default,
  };
});
