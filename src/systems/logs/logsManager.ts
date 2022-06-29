import { GatewayClientEvents, Structures } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import { Embed } from 'detritus-client/lib/utils';
import CacheCollection from '../../cache/CacheCollection';
import Client from '../../client';
import { DiscordEmojis, EmbedColors } from '../../utils/constants';
class LogsManager {
	constructor() {
		Client.on(ClientEvents.GUILD_MEMBER_ADD, async (payload: GatewayClientEvents.GuildMemberAdd) => {
            if(!payload.member) return;
            return await this.createJoinEmbed(payload.member)
        })
        Client.on(ClientEvents.GUILD_MEMBER_REMOVE, async (payload: GatewayClientEvents.GuildMemberRemove) => {
            if(!payload.member) return;
            return await this.createLeaveEmbed(payload.member)
        })
	}
	async createJoinEmbed(member: Structures.Member){
        const logChannel = (await CacheCollection.getOrFetch(member.guildId)).Channels.JoinLog
        if(member.guild.channels.has(logChannel)){
            const description = []
            description.push(`**Info**`)
            description.push(`**Usuario**: ${member.mention} \`${member.tag}\``)
            description.push(`**ID**: \`${member.id}\``)
            description.push(`**Bot**: ${member.bot ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO}`)
            description.push(`**Entrada**: <t:${Math.round(member.joinedAtUnix / 1000)}:R>`)
            const embed = new Embed()
            .setTitle('Join Log')
            .setColor(EmbedColors.MAIN)
            .setThumbnail(member.avatarUrl)
            .setFooter(`Member Count: ${member.guild.memberCount - 1} -> ${member.guild.memberCount}`)
            .setDescription(`Un usuario ha entrado al servidor\n${description.join('\n')}`)
            return member.guild.channels.get(logChannel).createMessage({embeds: [embed]})
        }
    }
    async createLeaveEmbed(member: Structures.Member){
        const logChannel = (await CacheCollection.getOrFetch(member.guildId)).Channels.ExitLog
        if(member.guild.channels.has(logChannel)){
            const description = []
            description.push(`**Info**`)
            description.push(`**Usuario**: ${member.mention} \`${member.tag}\``)
            description.push(`**ID**: \`${member.id}\``)
            description.push(`**Bot**: ${member.bot ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO}`)
            description.push(`**Salida**: <t:${Math.round(Date.now() / 1000)}:R>`)
            const embed = new Embed()
            .setTitle('Exit Log')
            .setColor(EmbedColors.MAIN)
            .setThumbnail(member.avatarUrl)
            .setFooter(`Member Count: ${member.guild.memberCount + 1} -> ${member.guild.memberCount}`)
            .setDescription(`Un usuario ha salido del servidor\n${description.join('\n')}`)
            return member.guild.channels.get(logChannel).createMessage({embeds: [embed]})
        }
    }
}

export const logsManager = new LogsManager();