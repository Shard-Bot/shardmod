export type CacheObject = {
	ServerID: String,
    Prefix: String,
 
    Channels: {
        JoinLog: String,
        ExitLog: String,
        ModLog: String
    },
 
    Roles: {
        MuteRol: String,
    },
 
    Users: {
        Trusted: Array<String>,
    },
 
    Modules: {
        AntiNuker: {
            Enabled: Boolean,
            Whitelist: {
                Roles: Array<String>,
                Users: Array<String>
            },
            Config: {
                maxBans: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxCreateEmojis: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxDeleteEmojis: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxCreatedChannels: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxCreatedRoles: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxDeletedChannels: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxDeletedRoles: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxKicks: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxUnbans: {
                    Enabled: Boolean,
                    Limit: Number
                },
            }
        },
 
        Lockdown: {
            Enabled: Boolean,
            Mode: String,
            Target: String
        },
 
        Automod: {
            Enabled: Boolean,
            Words: [{
                Word: String,
                Percent: Number
            }],
            Whitelist: {
                Roles: Array<String>,
                Users: Array<String>,
                Channels: Array<String>
            },
        },
 
        AntiWallText: {
            Enabled: Boolean,
            Limit: Number,
            PercentTimeLimit: Number,
            Percent: Number,
            Whitelist: {
                Roles: Array<String>,
                Users: Array<String>,
                Channels: Array<String>
            },
        },
 
        AntiFlood: {
            Enabled: Boolean,
            PercentTimeLimit: Number,
            Percent: Number,
            Whitelist: {
                Roles: Array<String>,
                Users: Array<String>,
                Channels: Array<String>
            },
        },
 
        AntiCaps: {
            Enabled: Boolean,
            Limit: Number,
            Percent: Number,
            PercentTimeLimit: Number,
            Whitelist: {
                Roles: Array<String>,
                Users: Array<String>,
                Channels: Array<String>
            },
        },
 
        AntiLinks: {
           AllowImages: Boolean,
           Percent: Number,
           PercentTimeLimit: Number,
           Whitelist: {
                Roles: Array<String>,
                Users: Array<String>,
                Channels: Array<String>
            },
        },
 
    }
}