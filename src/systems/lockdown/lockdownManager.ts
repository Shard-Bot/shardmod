import { GatewayClientEvents, Structures } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import { Embed } from 'detritus-client/lib/utils';
import ms from 'ms';
import CacheCollection from '../../cache/CacheCollection';
import Client from '../../client';
import { DiscordEmojis, EmbedColors } from '../../utils/constants';
import { timeoutMember, canTimeout} from '../../utils/functions'
class LockdownManager {
	constructor() {
		Client.on(
			ClientEvents.GUILD_MEMBER_ADD,
			async (payload: GatewayClientEvents.GuildMemberAdd) => {
				const serverData = await CacheCollection.getOrFetch(payload.guildId);
				const lockdownData = serverData.Modules.Lockdown;
				if (lockdownData.Enabled === false) return;

				if (lockdownData.Target === 'bots' && !payload.member.bot) return;
				if (lockdownData.Target === 'alts' && !this.isAltAccount(payload.member)) return;

				if (lockdownData.Mode === 'ban') {
					if (!this.canBanOrKick(payload.guildId, payload.member, 'canBanMembers')) return;
					payload.member
						.ban({ reason: `[Lockdown] Modo ${lockdownData.Mode} activado` })
						.then(async () => {
							let memberDm: boolean = true;
							if (payload.member.bot) memberDm = false;
							payload.member
								.createMessage({
									embeds: [
										this.DmMessage(
											payload.member.guild,
											Math.floor(Date.now() / 1000),
											lockdownData.Mode,
											lockdownData.Target
										),
									],
								})
								.catch((err) => {
									memberDm = false;
								})
								.then(() => {
									const channelId = serverData.Channels.BotLog;
									if (channelId.length && payload.member.guild.channels.has(channelId)) {
										payload.member.guild.channels
											.get(channelId)
											.createMessage({
												embeds: [
													this.succesMessage(
														payload.member,
														Math.floor(Date.now() / 1000),
														memberDm,
														lockdownData.Mode,
														lockdownData.Target
													),
												],
											})
											.catch(() => null);
									}
								});
						})
						.catch(() => null);
				} else if (lockdownData.Mode === 'kick') {
					if (!this.canBanOrKick(payload.guildId, payload.member, 'canKickMembers')) return;
					payload.member
						.remove({ reason: `[Lockdown] Modo ${lockdownData.Mode} activado` })
						.then(async () => {
							let memberDm: boolean = true;
							if (payload.member.bot) memberDm = false;
							payload.member
								.createMessage({
									embeds: [
										this.DmMessage(
											payload.member.guild,
											Math.floor(Date.now() / 1000),
											lockdownData.Mode,
											lockdownData.Target
										),
									],
								})
								.catch(() => {
									memberDm = false;
								})
								.then(() => {
									const channelId = serverData.Channels.BotLog;
									if (channelId.length && payload.member.guild.channels.has(channelId)) {
										payload.member.guild.channels
											.get(channelId)
											.createMessage({
												embeds: [
													this.succesMessage(
														payload.member,
														Math.floor(Date.now() / 1000),
														memberDm,
														lockdownData.Mode,
														lockdownData.Target
													),
												],
											})
											.catch(() => null);
									}
								});
						})
						.catch(() => null);
				} else if (lockdownData.Mode === 'timeout') {
					if (!canTimeout(payload.member.guild, payload.member)) return;
					for (let role of payload.member.roles.toArray()) {
						if (role.botId) {
							if (role.can(1 << 3))
								await role
									.edit({
										permissions: Number(role.permissions.toString()) - 0x8,
										reason: `[Lockdown] FORCED TIMEOUT`,
									})
									.catch(() => null)
						} else {
							if (role.can(1 << 3))
								await payload.member
									.removeRole(role.id, {
										reason: `[Lockdown] FORCED TIMEOUT`,
									})
									.catch(() => null)
						}
					}
					await timeoutMember({member: payload.member, time: ms('27d'), reason: `[Lockdown] Modo ${lockdownData.Mode} activado` })
						.then(async () => {
							let memberDm: boolean = true;
							if (payload.member.bot) memberDm = false;
							payload.member
								.createMessage({
									embeds: [
										this.DmMessage(
											payload.member.guild,
											Math.floor(Date.now() / 1000),
											lockdownData.Mode,
											lockdownData.Target
										),
									],
								})
								.catch(() => {
									memberDm = false;
								})
								.then(() => {
									const channelId = serverData.Channels.BotLog;
									if (channelId.length && payload.member.guild.channels.has(channelId)) {
										payload.member.guild.channels
											.get(channelId)
											.createMessage({
												embeds: [
													this.succesMessage(
														payload.member,
														Math.floor(Date.now() / 1000),
														memberDm,
														lockdownData.Mode,
														lockdownData.Target
													),
												],
											})
											.catch(() => null);
									}
								});
						})
						.catch(() => null);
				} 
			}
		);
	}
	canBanOrKick(guildId: string, member: Structures.Member, action: string) {
		if (Client.guilds.get(guildId).me.canEdit(member) && Client.guilds.get(guildId).me[action])
			return true;
		return false;
	}

	isAltAccount(member: Structures.Member) {
		if (Math.round(Date.now() - Number(member.user.createdAt)) / 1000 / 60 / 60 / 24 < 10) {
			const badges: string[] = [];

			for (let item in DiscordEmojis.DISCORD_BADGES) {
				if (member.user.hasFlag(parseInt(item))) {
					badges.push((DiscordEmojis.DISCORD_BADGES as any)[item]);
				}
			}
			if (member.user.avatar?.startsWith('a_')) {
				badges.push(DiscordEmojis.NITRO as any);
			}
			if (member.user.avatar !== null && badges.length) return false;
			return true;
		}
		return false;
	}

	DmMessage(guild: Structures.Guild, timestamp: number, mode: string, target: string) {
		const embed = new Embed();
		embed.setTitle('Lockdown Report');
		embed.setColor(EmbedColors.MAIN);
		embed.setThumbnail(guild.iconUrl);
		embed.setDescription(
			`**Has sido ${{ban: 'baneado', kick: 'expulsado', timeout: 'aislado temporalmente'}[mode]} de ${guild.name}!**`
		);
		embed.addField(
			'\u200b',
			`${DiscordEmojis.SERVER} **Servidor:** ${guild.name} | \`${guild.id}\``
		);
		embed.addField(
			'\u200b',
			`${DiscordEmojis.DOCUMENT} **Razón:** \`${this.createReason(mode, target)}\``
		);
		embed.addField('\u200b', `${DiscordEmojis.CLOCK} **Fecha:** <t:${timestamp}:R>`);
		return embed;
	}

	succesMessage(
		executor: Structures.Member,
		timestamp: number,
		memberDm: boolean,
		mode: string,
		target: string
	) {
		const embed = new Embed();
		embed.setTitle('Lockdown Alert');
		embed.setDescription(
			`**${executor.tag} ha sido ${{ban: 'baneado', kick: 'expulsado', timeout: 'aislado temporalmente'}[mode]}!**`
		);
		embed.setColor(EmbedColors.MAIN);
		embed.setThumbnail(executor.avatarUrl);
		embed.addField(
			'\u200b',
			`${DiscordEmojis.MEMBER} **Usuario:** ${executor.mention} | \`${executor.id}\``
		);
		embed.addField(
			'\u200b',
			`${DiscordEmojis.DOCUMENT} **Razón:** \`${this.createReason(mode, target)}\``
		);
		embed.addField('\u200b', `${DiscordEmojis.CLOCK} **Fecha:** <t:${timestamp}:R>`);
		embed.addField(
			`Mas detalles:`,
			`${DiscordEmojis.SPACE} ${DiscordEmojis.BLOCKUSER} **Ejecutor ${
				mode === 'ban' ? 'Baneado' : 'Expulsado'
			}?:** ${DiscordEmojis.CHECK}\n${DiscordEmojis.SPACE} ${
				DiscordEmojis.MAIL
			} **Aviso al ejecutor:** ${
				memberDm === false ? DiscordEmojis.CHECK_NO : DiscordEmojis.CHECK
			}`
		);
		return embed;
	}

	createReason(mode: string, target: string) {
		switch (target.toLowerCase()) {
			case 'bots':
				return `El modo actual (${mode}), no permite la entrada de bots`;
			case 'alts':
				return `El modo actual (${mode}), no permite la entrada de usuarios sospechosos`;
			default:
				return `El modo actual (${mode}), no permite la entrada de usuarios`;
		}
	}
}

export const lockdownManager = new LockdownManager();