import { Collections, GatewayClientEvents, Structures } from 'detritus-client';
import { AuditLogActions, ClientEvents } from 'detritus-client/lib/constants';
import Client from '../../client';
import CacheCollection from '../../cache/CacheCollection';
import baseManager from './baseManager';

class GuildChannelCreate extends Collections.BaseCollection<string, number> {
	bans: Collections.BaseCollection<string, number>;
	constructor() {
		super();
		this.bans = new Collections.BaseCollection<string, number>();
		Client.on(ClientEvents.CHANNEL_CREATE, async (payload: GatewayClientEvents.ChannelCreate) => {
			if (!(await baseManager.onBeforeAll(payload.channel.guildId, 'maxCreatedChannels'))) return;
			const serverData = await CacheCollection.getOrFetch(payload.channel.guildId);
			const executor = await this.fetchExecutor(payload.channel.guildId, payload.channel.id);
			if (!executor) return;
			if(this.bans.has(`${payload.channel.guildId}.${executor.id}`)) return;
			const data = this.get(`${payload.channel.guildId}.${executor.id}`);
			if (data) {
				if (data >= serverData.Modules.AntiNuker.Config['maxCreatedChannels'].Limit) {
					if (!(await baseManager.onBefore(payload.channel.guildId, executor)))
						return this.delete(`${payload.channel.guildId}.${executor.id}`);
					executor
						.ban({ reason: '[Antinuke] Usuario excedio el limite de canales creados.' })
						.then(() => {
							let memberDm: boolean = true;
							if (executor.bot) memberDm = false;
							if(this.bans.has(`${payload.channel.guildId}.${executor.id}`)) return;
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
								this.bans.set(`${executor.guild.id}.${executor.id}`, 1)
								setTimeout(() => {
									this.bans.delete(`${executor.guild.id}.${executor.id}`);
								}, 20000);
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
					return await entry.guild.fetchMember(entry.userId).catch(() => {
						return undefined;
					});
				}
			});
	}
}

class GuildChannelDelete extends Collections.BaseCollection<string, number> {
	bans: Collections.BaseCollection<string, number>;
	constructor() {
		super();
		this.bans = new Collections.BaseCollection<string, number>();
		Client.on(ClientEvents.CHANNEL_DELETE, async (payload: GatewayClientEvents.ChannelDelete) => {
			if (!(await baseManager.onBeforeAll(payload.channel.guildId, 'maxDeletedChannels'))) return;
			const serverData = await CacheCollection.getOrFetch(payload.channel.guildId);
			const executor = await this.fetchExecutor(payload.channel.guildId, payload.channel.id);
			if (!executor) return;
			if(this.bans.has(`${payload.channel.guildId}.${executor.id}`)) return;
			const data = this.get(`${payload.channel.guildId}.${executor.id}`);
			if (data) {
				if (data >= serverData.Modules.AntiNuker.Config['maxDeletedChannels'].Limit) {
					if (!(await baseManager.onBefore(payload.channel.guildId, executor)))
						return this.delete(`${payload.channel.guildId}.${executor.id}`);
						
					(executor as Structures.Member)
						.ban({ reason: '[Antinuke] Usuario excedio el limite de canales eliminados.' })
						.then(() => {
							let memberDm: boolean = true;
							if (executor.bot) memberDm = false;
							if(this.bans.has(`${payload.channel.guildId}.${executor.id}`)) return;
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
						    this.bans.set(`${executor.guild.id}.${executor.id}`, 1)
							setTimeout(() => {
								this.bans.delete(`${executor.guild.id}.${executor.id}`);
							}, 20000);
						
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
					return await entry.guild.fetchMember(entry.userId).catch(() => {
						return undefined;
					});
				}
			});
	}
}
export const guildChannelCreated = new GuildChannelCreate();
export const guildChannelDeleted = new GuildChannelDelete();
