const ACCESS_COOKIE = 'ecopro_at';
const REFRESH_COOKIE = 'ecopro_rt';
const CSRF_COOKIE = 'ecopro_csrf';
const STAFF_ACCESS_COOKIE = 'ecopro_staff_at';

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = (process.env.COOKIE_SAMESITE as any) || (isProduction ? 'none' : 'lax');
  const domain = process.env.COOKIE_DOMAIN || undefined;
  return { isProduction, sameSite, domain };
}

export function clearAuthCookies(res: any) {
  const { isProduction, sameSite, domain } = getCookieOptions();
  const base = {
    secure: isProduction,
    sameSite,
    domain,
  };
  res.clearCookie(ACCESS_COOKIE, { ...base, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...base, path: '/api/auth' });
  res.clearCookie(CSRF_COOKIE, { ...base, path: '/' });
  res.clearCookie(STAFF_ACCESS_COOKIE, { ...base, path: '/' });
}

export const cookieNames = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  CSRF_COOKIE,
  STAFF_ACCESS_COOKIE,
};
