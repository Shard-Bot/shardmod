export interface ServerConfig {
    ServerID: string,
    Prefixes: string[],

    Channels: {
        JoinLog: string,
        ExitLog: string,
        ModLog: string,
        BotLog: string
    },

    Roles: {
        MuteRol: string,
    },

    Users: {
        Trusted: string[],
    },

    Modules: {
        AntiNuker: {
            Enabled: boolean,
            Whitelist: {
                Roles: string[],
                Users: string[]
            },
            Config: {
                maxBans: {
                    Enabled: boolean,
                    Limit: number
                },
                maxCreateEmojis: {
                    Enabled: boolean,
                    Limit: number
                },
                maxDeleteEmojis: {
                    Enabled: boolean,
                    Limit: number
                },
                maxCreatedChannels: {
                    Enabled: boolean,
                    Limit: number
                },
                maxCreatedRoles: {
                    Enabled: boolean,
                    Limit: number
                },
                maxDeletedChannels: {
                    Enabled: boolean,
                    Limit: number
                },
                maxDeletedRoles: {
                    Enabled: boolean,
                    Limit: number
                },
                maxKicks: {
                    Enabled: boolean,
                    Limit: number
                },
                maxUnbans: {
                    Enabled: boolean,
                    Limit: number
                },
                maxInvitedBots: {
                    Enabled: boolean,
                    IgnoreVerified: boolean,
                    Limit: number
                },
            }
        },

        Lockdown: {
            Enabled: boolean,
            Mode: string,
            Target: string
        },

        Automod: {
            Enabled: boolean,
            PercentTimeLimit: number,
            Words: {
                Word: string,
                Percent: number
            }[],
            Whitelist: {
                Roles: string[],
                Users: string[],
                Channels: string[]
            },
        },

        AntiWallText: {
            Enabled: boolean,
            Limit: number,
            PercentTimeLimit: number,
            Percent: number,
            Whitelist: {
                Roles: string[],
                Users: string[],
                Channels: string[]
            },
        },

        AntiFlood: {
            Enabled: boolean,
            PercentTimeLimit: number,
            Percent: number,
            Whitelist: {
                Roles: string[],
                Users: string[],
                Channels: string[]
            },
        },

        AntiCaps: {
            Enabled: boolean,
            Limit: number,
            Percent: number,
            PercentTimeLimit: number,
            Whitelist: {
                Roles: string[],
                Users: string[],
                Channels: string[]
            },
        },

        AntiLinks: {
            Enabled: boolean,
            AllowImages: boolean,
            Percent: number,
            PercentTimeLimit: number,
            Whitelist: {
                Roles: string[],
                Users: string[],
                Channels: string[]
            },
        },

    }
}