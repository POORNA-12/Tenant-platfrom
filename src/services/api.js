/* ── Cookie helpers ── */
function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/* ── Token helpers (exported for use by services) ── */
export function getAccessToken() {
    return getCookie('access_token');
}

export function getRefreshToken() {
    return getCookie('refresh_token');
}

export function setTokens(access, refresh) {
    if (access) setCookie('access_token', access, 1);
    if (refresh) setCookie('refresh_token', refresh, 7);
}

export function clearTokens() {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    deleteCookie('tenant_slug');
    deleteCookie('user_email');
    deleteCookie('tenant_user_id');
    deleteCookie('tenant_id');
}

export function getTenantSlug() {
    return getCookie('tenant_slug');
}

export function setTenantSlug(slug) {
    setCookie('tenant_slug', slug, 7);
}

export function setUserEmail(email) {
    setCookie('user_email', email, 7);
}

export function getUserEmail() {
    return getCookie('user_email');
}

export function setTenantInfo(userId, tenantId) {
    if (userId) setCookie('tenant_user_id', userId, 7);
    if (tenantId) setCookie('tenant_id', tenantId, 7);
}

/* ── JWT expiry check ── */
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Refresh 30 seconds before actual expiry to be safe
        return payload.exp * 1000 < Date.now() + 30000;
    } catch {
        return true;
    }
}

/* ── Token refresh (single in-flight promise to avoid race conditions) ── */
let refreshPromise = null;

async function ensureFreshToken(slug) {
    const access = getAccessToken();

    // Token exists and is still valid → nothing to do
    if (access && !isTokenExpired(access)) return true;

    // Token is expired or missing → refresh it
    const refresh = getRefreshToken();
    const tenantSlug = slug || getTenantSlug();
    if (!refresh || !tenantSlug) return false;

    // If a refresh is already in flight, wait for it
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const res = await fetch(`/tenant_auth/${tenantSlug}/token-refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
            });

            if (!res.ok) return false;

            const data = await res.json();
            const tokens = data.data || data;
            if (tokens.access) {
                setTokens(tokens.access, tokens.refresh || refresh);
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Shared API client with automatic JSON handling and auth token attachment.
 * Before authenticated requests, proactively checks if the access token is
 * expired and refreshes it first. Also retries once on 401/500.
 */
export async function apiClient(endpoint, { method = 'GET', body, auth = false, slug } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    // Proactively refresh if token is expired BEFORE making the request
    if (auth) {
        await ensureFreshToken(slug);
        const token = getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const url = endpoint;

    let res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    // If 401 or 500 on an auth call, try refreshing once and retry
    if ((res.status === 401 || res.status === 500) && auth) {
        const refreshed = await ensureFreshToken(slug);
        if (refreshed) {
            headers['Authorization'] = `Bearer ${getAccessToken()}`;
            res = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });
        }
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const error = new Error(data?.detail || data?.message || 'Something went wrong');
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}
