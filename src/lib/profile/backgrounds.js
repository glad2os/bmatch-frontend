// Preset profile backgrounds; the keys are validated by the gateway (ProfileBackgrounds).
export const PROFILE_BACKGROUNDS = {
    default: '#232323',
    ocean: 'linear-gradient(135deg, #0F2027, #2C5364)',
    sunset: 'linear-gradient(135deg, #42275A, #A4508B)',
    forest: 'linear-gradient(135deg, #0B3D2E, #2D6A4F)',
    violet: 'linear-gradient(135deg, #2B1055, #5B4BB7)',
    graphite: 'linear-gradient(135deg, #232526, #4B4E52)'
};

export function profileBackground(key) {
    return PROFILE_BACKGROUNDS[key] ?? PROFILE_BACKGROUNDS.default;
}
