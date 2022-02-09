import { Collections, GatewayClientEvents } from 'detritus-client';
import { AuditLogActions, ClientEvents } from 'detritus-client/lib/constants';
import Client from '../../client';
import CacheCollection from '../../cache/CacheCollection';
import baseManager from './baseManager';

class GuildChannelCreate extends Collections.BaseCollection<string, number> {
	constructor() {
		super();
		Client.on(ClientEvents.CHANNEL_CREATE, async (payload: GatewayClientEvents.ChannelCreate) => {
			if (!baseManager.onBeforeAll(payload.channel.guildId, 'maxCreatedChannels')) return;
			const serverData = CacheCollection.get(payload.channel.guildId);
			const executor = await this.fetchExecutor(payload.channel.guildId, payload.channel.id);
			if (!executor) return;
			const data = this.get(`${payload.channel.guildId}.${executor.id}`);
			if (data) {
				if (data >= serverData.Modules.AntiNuker.Config['maxCreatedChannels'].Limit) {
					if (!baseManager.onBefore(payload.channel.guildId, executor))
						return this.delete(`${payload.channel.guildId}.${executor.id}`);
					executor
						.ban({ reason: '[Antinuke] Usuario excedio el limite de canales creados.' })
						.then(() => {
							let memberDm: boolean = true;
							if (executor.bot) memberDm = false;
							executor
								.createMessage({
									embeds: [
										baseManager.DmMessage(
											payload.channel.guild,
											Math.floor(Date.now() / 1000),
											'Usuario excedio el limite de canales creados en un corto periodo de tiempo.'
										),
									],
								})
								.catch(() => (memberDm = false))
								.then(() => {
									const channelId = serverData.Channels.BotLog;
									if (channelId.length && payload.channel.guild.channels.has(channelId)) {
										payload.channel.guild.channels
											.get(channelId)
											.createMessage({
												embeds: [
													baseManager.succesMessage(
														executor,
														Math.floor(Date.now() / 1000),
														'Usuario excedio el limite de canales creados en un corto periodo de tiempo.',
														memberDm
													),
												],
											})
											.catch(() => null);
									}
								});
						})
						.catch(() => null);
					this.delete(`${payload.channel.guildId}.${executor.id}`);
					return;
				}
				baseManager.addOne(payload.channel.guildId, executor, this);
			} else {
				baseManager.addOne(payload.channel.guildId, executor, this);
			}
		});
	}

	async fetchExecutor(guildId: string, channelId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.CHANNEL_CREATE })
			.then((log) => log.find((entry) => entry.targetId === channelId))
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

class GuildChannelDelete extends Collections.BaseCollection<string, number> {
	constructor() {
		super();
		Client.on(ClientEvents.CHANNEL_DELETE, async (payload: GatewayClientEvents.ChannelDelete) => {
			if (!baseManager.onBeforeAll(payload.channel.guildId, 'maxDeletedChannels')) return;
			const serverData = CacheCollection.get(payload.channel.guildId);
			const executor = await this.fetchExecutor(payload.channel.guildId, payload.channel.id);
			if (!executor) return;
			const data = this.get(`${payload.channel.guildId}.${executor.id}`);
			if (data) {
				if (data >= serverData.Modules.AntiNuker.Config['maxDeletedChannels'].Limit) {
					if (!baseManager.onBefore(payload.channel.guildId, executor))
						return this.delete(`${payload.channel.guildId}.${executor.id}`);
					executor
						.ban({ reason: '[Antinuke] Usuario excedio el limite de canales eliminados.' })
						.then(() => {
							let memberDm: boolean = true;
							if (executor.bot) memberDm = false;
							executor
								.createMessage({
									embeds: [
										baseManager.DmMessage(
											payload.channel.guild,
											Math.floor(Date.now() / 1000),
											'Usuario excedio el limite de canales eliminados en un corto periodo de tiempo.'
										),
									],
								})
								.catch(() => (memberDm = false))
								.then(() => {
									const channelId = serverData.Channels.BotLog;
									if (channelId.length && payload.channel.guild.channels.has(channelId)) {
										payload.channel.guild.channels
											.get(channelId)
											.createMessage({
												embeds: [
													baseManager.succesMessage(
														executor,
														Math.floor(Date.now() / 1000),
														'Usuario excedio el limite de canales eliminados en un corto periodo de tiempo.',
														memberDm
													),
												],
											})
											.catch(() => null);
									}
								});
						})
						.catch(() => null);
					this.delete(`${payload.channel.guildId}.${executor.id}`);
					return;
				}
				baseManager.addOne(payload.channel.guildId, executor, this);
			} else {
				baseManager.addOne(payload.channel.guildId, executor, this);
			}
		});
	}

	async fetchExecutor(guildId: string, channelId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.CHANNEL_DELETE })
			.then((log) => log.find((entry) => entry.targetId === channelId))
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
export const guildChannelCreated = new GuildChannelCreate();
export const guildChannelDeleted = new GuildChannelDelete();
