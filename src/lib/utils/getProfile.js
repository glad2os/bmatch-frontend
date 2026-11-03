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
