import { GatewayClientEvents } from 'detritus-client';
import { AuditLogActions, ClientEvents } from 'detritus-client/lib/constants';
import CacheCollection from '../../cache/CacheCollection';
import Client from '../../client';
import baseManager from './baseManager';

class GuildBotAddManager {
	constructor() {
		Client.on(
			ClientEvents.GUILD_MEMBER_ADD,
			async (payload: GatewayClientEvents.GuildMemberAdd) => {
				if (!(await baseManager.onBeforeAll(payload.guildId, 'maxInvitedBots'))) return;
				const executor = await this.fetchExecutor(payload.guildId, payload.member.id);
				if (!executor) return;
				if (!(await baseManager.onBefore(payload.guildId, executor))) return;
				const serverData = await CacheCollection.getOrFetch(payload.guildId);
				if (
					serverData.Modules.AntiNuker.Config.maxInvitedBots.IgnoreVerified === true &&
					payload.member.user.hasVerifiedBot
				)
					return;
				executor
					.ban({
						reason: `[Antinuke] Usuario invito a ${payload.member.tag} sin autorización.`,
					})
					.then(() => {
						let memberDm: boolean = true;
						if (executor.bot) memberDm = false;
						executor
							.createMessage({
								embeds: [
									baseManager.DmMessage(
										payload.member.guild,
										Math.floor(Date.now() / 1000),
										`Usuario invito a un bot (${payload.member.tag}) sin autorización.`
									),
								],
							})
							.catch(() => (memberDm = false))
							.then(() => {
								const channelId = serverData.Channels.BotLog;
								if (channelId.length && payload.member.guild.channels.has(channelId)) {
									payload.member.guild.channels
										.get(channelId)
										.createMessage({
											embeds: [
												baseManager.succesMessage(
													executor,
													Math.floor(Date.now() / 1000),
													`Usuario invito a un bot (${payload.member.tag}) sin autorización.`,
													memberDm
												),
											],
										})
										.catch(() => null);
								}
							});
					})
					.catch(() => null);
				payload.member.ban({ reason: `[Antinuke] Bot invitado por ${executor.tag}` });
				return;
			}
		);
	}

	async fetchExecutor(guildId: string, botId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.BOT_ADD })
			.then((log) => log.find((entry) => entry.targetId === botId))
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
}

export const guildBotAddManager = new GuildBotAddManager();
