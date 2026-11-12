import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  // Ensure /admin is never indexed by search engines
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  const isLoginRoute = pathname === "/admin/login";

  if (!isSupabaseConfigured()) {
    if (!isLoginRoute) {
      const redirectUrl = new URL("/admin/login", request.url);
      const res = NextResponse.redirect(redirectUrl);
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res;
    }
    return response;
  }

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLoginRoute) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }

  if (user && isLoginRoute) {
    const adminUrl = new URL("/admin", request.url);
    const res = NextResponse.redirect(adminUrl);
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

