import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async (params) => {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;
  console.log(store.getAll());
  console.log("Route param locale:", params.locale);
  console.log("Cookie locale:", cookieLocale);
  const effectiveLocale = params.locale || cookieLocale || "en";
  console.log("Effective locale:", effectiveLocale);
  return {
    locale: effectiveLocale,
    messages: (await import(`./locales/${effectiveLocale}.json`)).default,
  };
});
