// "GG, WP" in the chat (any case and punctuation, e.g. "gg wp", "GG,WP!") asks to leave the game.
export function isExitPhrase(message) {
    return /^\s*gg[\s,.!]*wp[\s.!]*$/i.test(message ?? '');
}
