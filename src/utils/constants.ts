import {
   UserFlags as DiscordUserFlags,
   Permissions,
   GuildExplicitContentFilterTypes,
   VerificationLevels,
} from 'detritus-client/lib/constants';

export const DiscordEmojis = Object.freeze({
   DISCORD_BADGES: {
      [DiscordUserFlags.STAFF]: '<:Discord_Employee:907818284643135549>',
      [DiscordUserFlags.PARTNER]: '<:partner:907032592409329725>',
      [DiscordUserFlags.HYPESQUAD]: '<:hypesquad:919477592896196648>',
      [DiscordUserFlags.BUG_HUNTER_LEVEL_1]: '<:bug_hunter:907038485972656138>',
      [DiscordUserFlags.HYPESQUAD_ONLINE_HOUSE_1]: '<:bravery:907038402170458192>',
      [DiscordUserFlags.HYPESQUAD_ONLINE_HOUSE_2]: '<:brillance:907038433749368893>',
      [DiscordUserFlags.HYPESQUAD_ONLINE_HOUSE_3]: '<:balance:907038166886776892>',
      [DiscordUserFlags.PREMIUM_EARLY_SUPPORTER]: '<:early_support:907037800610807829>',
      [DiscordUserFlags.BUG_HUNTER_LEVEL_2]: '<:bug_hunter2:907038601152450600>',
      [DiscordUserFlags.VERIFIED_DEVELOPER]: '<:early_dev:907037746340712468>',
      [DiscordUserFlags.DISCORD_CERTIFIED_MODERATOR]: '<:certified_moderator:919478567157501983>',
   },
   NITRO: '<:discord_nitro:919480571330183198>',
   NEXT: '<:next:925098720045973505>',
   PREVIOUS: '<:previous:925098782767603714>',
   CANCEL: '<:cancel:925098803621687426>',
   ON: '<:onshard:913209782268203029>',
   OFF: '<:offshard:913209821363335178>'
});

export const EmbedColors = Object.freeze({
   MAIN: 41704,
   ERROR: 16071997,
   SUCCESS: 8123709,
});

export const PERMISSIONS = Object.freeze([
   Permissions.ADMINISTRATOR,
   Permissions.BAN_MEMBERS,
   Permissions.CHANGE_NICKNAMES,
   Permissions.KICK_MEMBERS,
   Permissions.MANAGE_CHANNELS,
   Permissions.MANAGE_EMOJIS,
   Permissions.MANAGE_GUILD,
   Permissions.MANAGE_MESSAGES,
   Permissions.MANAGE_ROLES,
   Permissions.MANAGE_THREADS,
   Permissions.MANAGE_WEBHOOKS,
   Permissions.VIEW_AUDIT_LOG,
   Permissions.VIEW_GUILD_ANALYTICS,
   Permissions.ADD_REACTIONS,
   Permissions.ATTACH_FILES,
   Permissions.CREATE_INSTANT_INVITE,
   Permissions.EMBED_LINKS,
   Permissions.MENTION_EVERYONE,
   Permissions.READ_MESSAGE_HISTORY,
   Permissions.SEND_MESSAGES,
   Permissions.SEND_TTS_MESSAGES,
   Permissions.USE_APPLICATION_COMMANDS,
   Permissions.USE_EXTERNAL_EMOJIS,
   Permissions.USE_PRIVATE_THREADS,
   Permissions.USE_PUBLIC_THREADS,
   Permissions.VIEW_CHANNEL,
   Permissions.CONNECT,
   Permissions.CREATE_INSTANT_INVITE,
   Permissions.DEAFEN_MEMBERS,
   Permissions.MOVE_MEMBERS,
   Permissions.MUTE_MEMBERS,
   Permissions.PRIORITY_SPEAKER,
   Permissions.REQUEST_TO_SPEAK,
   Permissions.SPEAK,
   Permissions.STREAM,
   Permissions.USE_VAD,
   Permissions.VIEW_CHANNEL,
]);

export const PermissionsText = Object.freeze({
   [String(Permissions.ADD_REACTIONS)]: 'Add Reactions',
   [String(Permissions.ADMINISTRATOR)]: 'Administrator',
   [String(Permissions.ATTACH_FILES)]: 'Attach Files',
   [String(Permissions.BAN_MEMBERS)]: 'Ban Members',
   [String(Permissions.CHANGE_NICKNAME)]: 'Change Nickname',
   [String(Permissions.CHANGE_NICKNAMES)]: 'Change Nicknames',
   [String(Permissions.CONNECT)]: 'Connect',
   [String(Permissions.CREATE_INSTANT_INVITE)]: 'Create Instant Invite',
   [String(Permissions.DEAFEN_MEMBERS)]: 'Deafen Members',
   [String(Permissions.EMBED_LINKS)]: 'Embed Links',
   [String(Permissions.KICK_MEMBERS)]: 'Kick Members',
   [String(Permissions.MANAGE_CHANNELS)]: 'Manage Channels',
   [String(Permissions.MANAGE_EMOJIS)]: 'Manage Emojis',
   [String(Permissions.MANAGE_GUILD)]: 'Manage Guild',
   [String(Permissions.MANAGE_MESSAGES)]: 'Manage Messages',
   [String(Permissions.MANAGE_ROLES)]: 'Manage Roles',
   [String(Permissions.MANAGE_THREADS)]: 'Manage Threads',
   [String(Permissions.MANAGE_WEBHOOKS)]: 'Manage Webhooks',
   [String(Permissions.MENTION_EVERYONE)]: 'Mention Everyone',
   [String(Permissions.MOVE_MEMBERS)]: 'Move Members',
   [String(Permissions.MUTE_MEMBERS)]: 'Mute Members',
   [String(Permissions.NONE)]: 'None',
   [String(Permissions.PRIORITY_SPEAKER)]: 'Priority Speaker',
   [String(Permissions.READ_MESSAGE_HISTORY)]: 'Read Message History',
   [String(Permissions.REQUEST_TO_SPEAK)]: 'Request To Speak',
   [String(Permissions.SEND_MESSAGES)]: 'Send Messages',
   [String(Permissions.SEND_TTS_MESSAGES)]: 'Text-To-Speech',
   [String(Permissions.SPEAK)]: 'Speak',
   [String(Permissions.STREAM)]: 'Go Live',
   [String(Permissions.USE_APPLICATION_COMMANDS)]: 'Use Application Commands',
   [String(Permissions.USE_EXTERNAL_EMOJIS)]: 'Use External Emojis',
   [String(Permissions.USE_PRIVATE_THREADS)]: 'Use Private Threads',
   [String(Permissions.USE_PUBLIC_THREADS)]: 'Use Public Threads',
   [String(Permissions.USE_VAD)]: 'Voice Auto Detect',
   [String(Permissions.VIEW_AUDIT_LOG)]: 'View Audit Logs',
   [String(Permissions.VIEW_CHANNEL)]: 'View Channel',
   [String(Permissions.VIEW_GUILD_ANALYTICS)]: 'View Guild Analytics',
});

export const GuildContentFilterTypes = Object.freeze({
   [GuildExplicitContentFilterTypes.DISABLED]: 'Desactivado',
   [GuildExplicitContentFilterTypes.MEMBERS_WITHOUT_ROLES]: 'Usuarios sin roles',
   [GuildExplicitContentFilterTypes.ALL_MEMBERS]: 'Todos',
});

export const VerificationLevel: Record<string, string> = Object.freeze({
   [VerificationLevels.NONE]: 'Desactivado',
   [VerificationLevels.LOW]: 'Bajo',
   [VerificationLevels.MEDIUM]: 'Medio',
   [VerificationLevels.HIGH]: 'Alto',
   [VerificationLevels.VERY_HIGH]: 'Muy Alto',
});

export const BotModules = [
   'AntiNuker',
   'AntiFlood',
   'AntiWallText',
   'Automod',
   'AntiLinks',
   'AntiCaps'
];

export const BotLogs = [
   'ExitLog',
   'JoinLog',
   'ModLog'
]

export const AntiNukesModules = {
   'maxbans': 'maxBans',
   'maxunbans': 'maxUnbans',
   'maxcreatedchannels': 'maxCreatedChannels',
   'maxdeletedChannels': 'maxDeletedChannels',
   'maxinvitedbots': 'maxInvitedBots',
   'maxkicks': 'maxKicks',
   'maxcreatedRoles': 'maxCreatedRoles',
   'maxdeletedRoles': 'maxDeletedRoles',
   'maxcreatedEmojis': 'maxCreatedEmojis',
   'maxdeletedEmojis': 'maxDeletedEmojis'
}

export const AntiSpamModules = {
   'antiflood': 'AntiFlood',
   'anticaps': 'AntiCaps',   
   'antiwalltext': 'AntiWallText',
   'antilinks': 'AntiLinks',   
   'automod': 'Automod',
}