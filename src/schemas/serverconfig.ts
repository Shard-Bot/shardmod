import * as mongoose from 'mongoose';
import { ServerConfig } from '../utils/types';

export const defaultData = (guildId: string) => ({
    ServerID: guildId,
    Prefixes: [],

    Channels: {
        JoinLog: '',
        ExitLog: '',
        ModLog: '',
        BotLog: '',
    },

    Roles: {
        MuteRol: '',
    },

    Users: {
        Trusted: [],
    },

    Modules: {
        AntiNuker: {
            Enabled: false,
            Whitelist: {
                Roles: [],
                Users: [],
            },
            Config: {
                maxBans: {
                    Enabled: true,
                    Limit: 5,
                },
                maxCreatedEmojis: {
                    Enabled: true,
                    Limit: 5,
                },
                maxDeletedEmojis: {
                    Enabled: true,
                    Limit: 5,
                },
                maxCreatedChannels: {
                    Enabled: true,
                    Limit: 5,
                },
                maxCreatedRoles: {
                    Enabled: true,
                    Limit: 5,
                },
                maxDeletedChannels: {
                    Enabled: true,
                    Limit: 5,
                },
                maxDeletedRoles: {
                    Enabled: true,
                    Limit: 5,
                },
                maxKicks: {
                    Enabled: true,
                    Limit: 5,
                },
                maxUnbans: {
                    Enabled: true,
                    Limit: 5,
                },
                maxInvitedBots: {
                    Enabled: true,
                    IgnoreVerified: true,
                    Limit: 1,
                }
            },
        },

        Lockdown: {
            Enabled: false,
            Mode: 'mute',
            Target: 'alts',
        },

        Automod: {
            Enabled: false,
            PercentTimeLimit: 10,
            Words: [],
            Whitelist: {
                Roles: [],
                Users: [],
                Channels: [],
            },
        },

        AntiWallText: {
            Enabled: false,
            Limit: 600,
            PercentTimeLimit: 10,
            Percent: 100,
            Whitelist: {
                Roles: [],
                Users: [],
                Channels: [],
            },
        },

        AntiFlood: {
            Enabled: false,
            PercentTimeLimit: 10,
            Percent: 15,
            Whitelist: {
                Roles: [],
                Users: [],
                Channels: [],
            },
        },

        AntiCaps: {
            Enabled: false,
            Limit: 30,
            Percent: 30,
            PercentTimeLimit: 10,
            Whitelist: {
                Roles: [],
                Users: [],
                Channels: [],
            },
        },

        AntiLinks: {
            Enabled: false,
            AllowImages: false,
            Percent: 100,
            PercentTimeLimit: 10,
            Whitelist: {
                Roles: [],
                Users: [],
                Channels: [],
            },
        },
    },
})

const Schema = new mongoose.Schema({
    ServerID: String,
    Prefixes: Array,

    Channels: {
        JoinLog: String,
        ExitLog: String,
        ModLog: String,
        BotLog: String,
    },

    Roles: {
        MuteRol: String,
    },

    Users: {
        Trusted: Array,
    },

    Modules: {
        AntiNuker: {
            Enabled: Boolean,
            Whitelist: {
                Roles: Array,
                Users: Array
            },
            Config: {
                maxBans: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxCreatedEmojis: {
                    Enabled: Boolean,
                    Limit: Number
                },
                maxDeletedEmojis: {
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
                maxInvitedBots: {
                    Enabled: Boolean,
                    IgnoreVerified: Boolean,
                    Limit: Number
                }
            }
        },

        Lockdown: {
            Enabled: Boolean,
            Mode: String,
            Target: String
        },

        Automod: {
            Enabled: Boolean,
            PercentTimeLimit: Number,
            Words: [{
                Word: String,
                Percent: Number
            }],
            Whitelist: {
                Roles: Array,
                Users: Array,
                Channels: Array
            },
        },

        AntiWallText: {
            Enabled: Boolean,
            Limit: Number,
            PercentTimeLimit: Number,
            Percent: Number,
            Whitelist: {
                Roles: Array,
                Users: Array,
                Channels: Array
            },
        },

        AntiFlood: {
            Enabled: Boolean,
            PercentTimeLimit: Number,
            Percent: Number,
            Whitelist: {
                Roles: Array,
                Users: Array,
                Channels: Array
            },
        },

        AntiCaps: {
            Enabled: Boolean,
            Limit: Number,
            Percent: Number,
            PercentTimeLimit: Number,
            Whitelist: {
                Roles: Array,
                Users: Array,
                Channels: Array
            },
        },

        AntiLinks: {
            Enabled: Boolean,
            AllowImages: Boolean,
            Percent: Number,
            PercentTimeLimit: Number,
            Whitelist: {
                Roles: Array,
                Users: Array,
                Channels: Array
            },
        },

    }
}, {versionKey: false})

export const Model = mongoose.model<ServerConfig>("ServerConfig", Schema) 
