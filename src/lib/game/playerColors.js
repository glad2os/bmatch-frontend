// One colour per seat, assigned by position in the player list. The server sends the list in the
// same order to every client (humans first, then bots), so everyone sees the same colours.
export const PLAYER_COLORS = ['#38BDF8', '#FBBF24', '#34D399', '#C084FC'];

// Bubbles opened before this client joined have no known owner.
export const UNKNOWN_OWNER_COLOR = 'rgba(255, 255, 255, 0.75)';

export function playerColor(index) {
    return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

// Humans and bots can share an id value, so the type is part of the key.
export function playerKey(type, id) {
    return `${type}:${id}`;
}
