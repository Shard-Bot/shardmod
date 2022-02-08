import { Collections, GatewayClientEvents } from 'detritus-client';
import { AuditLogActions, ClientEvents } from 'detritus-client/lib/constants';
import Client from '../../client';
import CacheCollection from '../../cache/CacheCollection';
import baseManager from './baseManager';

class GuildBanCreate extends Collections.BaseCollection<string, number> {
	constructor() {
		super();
		Client.on(ClientEvents.GUILD_BAN_ADD, async (payload: GatewayClientEvents.GuildBanAdd) => {
			if (!baseManager.onBeforeAll(payload.guildId, 'maxBans')) return;
			const serverData = CacheCollection.get(payload.guildId);
			const executor = await this.fetchExecutor(payload.guildId, payload.user.id);
			if (!executor) return;
			const data = this.get(`${payload.guildId}.${executor.id}`);
			if (data) {
				if (data >= serverData.Modules.AntiNuker.Config['maxBans'].Limit) {
					if (!baseManager.onBefore(payload.guildId, executor))
						return this.delete(`${payload.guildId}.${executor.id}`);
					executor
						.ban({ reason: '[Antinuke] Usuario excedio el limite de baneos.' })
						.then(() => {
							const serverData = CacheCollection.get(payload.guildId);
							let memberDm: boolean = true;
							executor
								.createMessage({
									embeds: [
										baseManager.DmMessage(
											payload.guild,
											Math.floor(Date.now() / 1000),
											'Usuario excedio el limite de baneos en un corto periodo de tiempo'
										),
									],
								})
								.catch(() => (memberDm = false));
							if (executor.bot) memberDm = false;
							const channelId = serverData.Channels.BotLog;
							if (channelId.length && payload.guild.channels.has(channelId)) {
								payload.guild.channels
									.get(channelId)
									.createMessage({
										embeds: [
											baseManager.succesMessage(
												executor,
												Math.floor(Date.now() / 1000),
												'Usuario excedio el limite de baneos en un corto periodo de tiempo',
												memberDm
											),
										],
									})
									.catch(() => null);
							}
						})
						.catch(() => null);
					this.delete(`${payload.guildId}.${executor.id}`);
					return;
				}
				baseManager.addOne(payload.guildId, executor, this);
			} else {
				baseManager.addOne(payload.guildId, executor, this);
			}
		});
	}

	async fetchExecutor(guildId: string, userId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.MEMBER_BAN_ADD })
			.then((log) => log.find((entry) => entry.targetId === userId))
			.then(async (entry) => {
				if (!entry) return;
				if (entry.guild.members.has(entry.userId)) {
					return entry.guild.members.get(entry.userId);
				} else {
					return await entry.guild.fetchMember(entry.userId);
				}
			});
	}
}

class GuildBanRemove extends Collections.BaseCollection<string, number> {
	constructor() {
		super();
		Client.on(
			ClientEvents.GUILD_BAN_REMOVE,
			async (payload: GatewayClientEvents.GuildBanRemove) => {
				if (!baseManager.onBeforeAll(payload.guildId, 'maxBans')) return;
				const serverData = CacheCollection.get(payload.guildId);
				const executor = await this.fetchExecutor(payload.guildId, payload.user.id);
				if (!executor) return;
				const data = this.get(`${payload.guildId}.${executor.id}`);
				if (data) {
					if (data >= serverData.Modules.AntiNuker.Config['maxBans'].Limit) {
						if (!baseManager.onBefore(payload.guildId, executor))
							return this.delete(`${payload.guildId}.${executor.id}`);
						executor
							.ban({ reason: '[Antinuke] Usuario excedio el limite de desbaneos.' })
							.then(() => {
								const serverData = CacheCollection.get(payload.guildId);
								let memberDm: boolean = true;
								executor
									.createMessage({
										embeds: [
											baseManager.DmMessage(
												payload.guild,
												Math.floor(Date.now() / 1000),
												'Usuario excedio el limite de desbaneos en un corto periodo de tiempo'
											),
										],
									})
									.catch(() => (memberDm = false));
								if (executor.bot) memberDm = false;
								const channelId = serverData.Channels.BotLog;
								if (channelId.length && payload.guild.channels.has(channelId)) {
									payload.guild.channels
										.get(channelId)
										.createMessage({
											embeds: [
												baseManager.succesMessage(
													executor,
													Math.floor(Date.now() / 1000),
													'Usuario excedio el limite de desbaneos en un corto periodo de tiempo',
													memberDm
												),
											],
										})
										.catch(() => null);
								}
							})
							.catch(() => null);
						this.delete(`${payload.guildId}.${executor.id}`);
						return;
					}
					baseManager.addOne(payload.guildId, executor, this);
				} else {
					baseManager.addOne(payload.guildId, executor, this);
				}
			}
		);
	}

	async fetchExecutor(guildId: string, userId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.MEMBER_BAN_REMOVE })
			.then((log) => log.find((entry) => entry.targetId === userId))
			.then(async (entry) => {
				if (!entry) return undefined;
				if (entry.guild.members.has(entry.userId)) {
					return entry.guild.members.get(entry.userId);
				} else {
					return await entry.guild.fetchMember(entry.userId);
				}
			});
	}
}
export const guildBanCreate = new GuildBanCreate();
export const guildBanRemove = new GuildBanRemove();
