import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// All locales supported by the app
export const locales = ["en", "es", "fr", "de"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  const typedLocale = locale as Locale;

  return {
    locale: typedLocale,
    messages: (await import(`../messages/${typedLocale}.json`)).default,
  };
});
