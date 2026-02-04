"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const parseCookies = () =>
  document.cookie
    ? document.cookie.split("; ").map((cookie) => {
        const index = cookie.indexOf("=");
        const name = decodeURIComponent(cookie.slice(0, index));
        const value = decodeURIComponent(cookie.slice(index + 1));
        return { name, value };
      })
    : [];

const setCookie = (name: string, value: string, options?: Record<string, string | boolean | number>) => {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  const opts = options || {};

  if (opts.maxAge) cookie += `; Max-Age=${opts.maxAge}`;
  if (opts.expires) cookie += `; Expires=${opts.expires}`;
  cookie += `; Path=${opts.path || "/"}`;
  if (opts.domain) cookie += `; Domain=${opts.domain}`;
  if (opts.secure) cookie += `; Secure`;
  if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`;

  document.cookie = cookie;
};

export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      return parseCookies();
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, string | boolean | number> }>) {
      cookiesToSet.forEach(({ name, value, options }) => {
        setCookie(name, value, options);
      });
    },
  },
});
