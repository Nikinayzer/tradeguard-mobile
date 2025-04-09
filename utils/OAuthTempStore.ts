let discordCodeVerifier: string | undefined;

export const setDiscordCodeVerifier = (val: string) => {
    discordCodeVerifier = val;
};

export const getDiscordCodeVerifier = () => discordCodeVerifier;