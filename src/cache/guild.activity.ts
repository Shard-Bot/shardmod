import { Collections, Structures } from 'detritus-client';
import { AuditLogActions, AuditLogActionTypes, ClientEvents } from 'detritus-client/lib/constants';
import Client from '../client';
import { GuildActivity } from '../utils/types';

const guildData = new Collections.BaseCollection<
	string,
	GuildActivity
>();

function createData(guildId: string){
    if(guildData.has(guildId)) return;
    let newData = guildData.set(guildId, {Mentions: [], Bans: [], Emojis: [], Channels: [], Roles: []});
    return newData.get(guildId);
}

async function fetchExecutor(guildId: string, target: string, action: number): Promise<Structures.Member|undefined> {
    if(!Client.guilds.get(guildId).me.canViewAuditLogs) return;
    return Client.rest
        .fetchGuildAuditLogs(guildId, { actionType: action })
        .then((log) => log.find((entry) => entry.targetId === target))
        .then(async (entry) => {
            if (!entry) return undefined;
            if (entry.guild.members.has(entry.userId)) {
                return entry.guild.members.get(entry.userId);
            } else {
                return await entry.guild.fetchMember(entry.userId).catch(() => {
                    return undefined;
                });
            }
        });
}
Client.on(ClientEvents.GUILD_ROLE_DELETE, async (payload) => {
    if(!payload.role) return;
    let data = guildData.get(payload.guildId);
    if(!data) data = createData(payload.guildId);
    const executor = await fetchExecutor(payload.guildId, payload.role.id, AuditLogActions.ROLE_DELETE);
    if(!executor) return;
    data.Roles.unshift({
        message: `• ${executor.tag} eliminó el rol \`${payload.role.name}\` - <t:${Math.round(Date.now() / 1000)}:R>`,
    });
})
Client.on(ClientEvents.GUILD_ROLE_CREATE, async (payload) => {
    if(!payload.role) return;
    let data = guildData.get(payload.guildId);
    if(!data) data = createData(payload.guildId);
    const executor = await fetchExecutor(payload.guildId, payload.role.id, AuditLogActions.ROLE_CREATE);
    if(!executor) return;
    data.Roles.unshift({
        message: `• ${executor.tag} creó el rol \`${payload.role.name}\` - <t:${Math.round(Date.now() / 1000)}:R>`,
    });
})
Client.on(ClientEvents.CHANNEL_CREATE, async (payload) => {
    if(!payload.channel) return;
    let data = guildData.get(payload.channel.guildId);
    if(!data) data = createData(payload.channel.guildId);
    const executor = await fetchExecutor(payload.channel.guildId, payload.channel.id, AuditLogActions.CHANNEL_CREATE);
    if(!executor) return;
    data.Channels.unshift({
        message: `• ${executor.tag} creó el canal \`${payload.channel.name}\` - <t:${Math.round(Date.now() / 1000)}:R>`,
    });
})
Client.on(ClientEvents.CHANNEL_DELETE, async (payload) => {
    if(!payload.channel) return;
    let data = guildData.get(payload.channel.guildId);
    if(!data) data = createData(payload.channel.guildId);
    const executor = await fetchExecutor(payload.channel.guildId, payload.channel.id, AuditLogActions.CHANNEL_CREATE);
    if(!executor) return;
    data.Channels.unshift({
        message: `• ${executor.tag} eliminó el canal \`${payload.channel.name}\` - <t:${Math.round(Date.now() / 1000)}:R>`,
    });
})
Client.on(ClientEvents.GUILD_EMOJIS_UPDATE, async (payload) => {
    if (payload.differences.deleted.size){
        let data = guildData.get(payload.guildId);
        if(!data) data = createData(payload.guildId);
        const executor = await fetchExecutor(payload.guildId, payload.differences.deleted.first().id, AuditLogActionTypes.EMOJI_DELETE);
        if(!executor) return;
        data.Emojis.unshift({
            message: `• ${executor.tag} eliminó el emoji \`${payload.differences.deleted.first().name}\` - <t:${Math.round(Date.now() / 1000)}:R>`,
        });
    } else if(payload.differences.created.size){
        let data = guildData.get(payload.guildId);
        if(!data) data = createData(payload.guildId);
        const executor = await fetchExecutor(payload.guildId, payload.differences.created.first().id, AuditLogActionTypes.EMOJI_CREATE);
        if(!executor) return;
        data.Emojis.unshift({
            message: `• ${executor.tag} creó el emoji \`${payload.differences.created.first().name}\` - <t:${Math.round(Date.now() / 1000)}:R>`,
        });
    }
})
Client.on(ClientEvents.MESSAGE_CREATE, async (payload) => {
    if(!payload.message.guild) return;
    if(!payload.message.author) return;
    let data = guildData.get(payload.message.guildId);
    if(!data) data = createData(payload.message.guildId);
    if(data.Mentions.length > 9) data.Mentions.pop();    
    const mention = payload.message.mentions.first()?.mention || payload.message.mentionRoles.first()?.mention
    if(!mention) return;
    data.Mentions.unshift({
        message: `• ${payload.message.author.tag} mencionó a ${mention} - <t:${Math.round(Date.now() / 1000)}:R>`
    });
})
export { guildData, createData };
