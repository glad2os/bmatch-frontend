import config from "./config";
let apiUrl = config.apiUrl

export async function getProfile(token) {

    const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    switch (response.status) {
        case 500:
            alert("Server error" + (await response.json()).message);
            return null;
        case 401:
            if (!window.location.href.includes('/game/'))
                window.location.href = '/login';
            return null;
        case 200:
            return response.json();
        default:
            return null;
    }
}

export async function apiLogin(email, password) {

    const response = await fetch(`${apiUrl}/api/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    let data = await response.json();
    switch (response.status) {
        case 200:
            return data;
        default:
            alert(data.message);
            return null;
    }
}

export async function apiSignUp(email, password, username) {

    const response = await fetch(`${apiUrl}/api/user/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "username": username,
            "password": password,
            "email": email
        }),
    });

    let data = await response.json();
    switch (response.status) {
        case 200:
            return data;
        default:
            alert(data.message);
            return null;
    }
}

async function sendJson(path, method, token, body) {
    const response = await fetch(`${apiUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {'Authorization': `Bearer ${token}`} : {})
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    let data = null;
    try {
        data = await response.json();
    } catch {
        // Empty body (e.g. 401 or 404).
    }
    return {ok: response.ok, status: response.status, data};
}

// Saves the signed-in user's profile; returns {ok, status, data} with the updated profile or an error message.
export function apiUpdateProfile(token, profile) {
    return sendJson('/api/user/profile', 'PUT', token, profile);
}

export function apiChangePassword(token, currentPassword, newPassword) {
    return sendJson('/api/user/password', 'PUT', token, {currentPassword, newPassword});
}

// Public profile, readable without signing in (shared links).
export function apiPublicProfile(userId) {
    return sendJson(`/api/user/public/${encodeURIComponent(userId)}`, 'GET');
}

// Averages of the analysed games of a player (bmatch-analytics), public like the profile.
export function apiPlayerStats(userId) {
    return sendJson(`/api/user/public/${encodeURIComponent(userId)}/stats`, 'GET');
}
