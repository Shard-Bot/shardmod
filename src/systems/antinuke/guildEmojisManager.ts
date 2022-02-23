import { Collections, GatewayClientEvents } from 'detritus-client';
import { AuditLogActions, ClientEvents } from 'detritus-client/lib/constants';
import Client from '../../client';
import CacheCollection from '../../cache/CacheCollection';
import baseManager from './baseManager';

class GuildEmojiCreate extends Collections.BaseCollection<string, number> {
	constructor() {
		super();
		Client.on(
			ClientEvents.GUILD_EMOJIS_UPDATE,
			async (payload: GatewayClientEvents.GuildEmojisUpdate) => {
				const createdEmojis = payload.differences.created;
				const serverData = CacheCollection.get(payload.guildId);
				if (createdEmojis.size) {
					if (!baseManager.onBeforeAll(payload.guildId, 'maxCreatedEmojis')) return;
					const executor = await this.fetchExecutor(payload.guildId, createdEmojis.first().id);
					if (!executor) return;
					const data = this.get(`${payload.guildId}.${executor.id}`);
					if (data) {
						if (data >= serverData.Modules.AntiNuker.Config['maxCreatedEmojis'].Limit) {
							if (!baseManager.onBefore(payload.guildId, executor))
								return this.delete(`${payload.guildId}.${executor.id}`);
							executor
								.ban({ reason: '[Antinuke] Usuario excedio el limite de emojis creados.' })
								.then(() => {
									let memberDm: boolean = true;
									if (executor.bot) memberDm = false;
									executor
										.createMessage({
											embeds: [
												baseManager.DmMessage(
													payload.guild,
													Math.floor(Date.now() / 1000),
													'Usuario excedio el limite de emojis creados en un corto periodo de tiempo.'
												),
											],
										})
										.catch(() => (memberDm = false))
										.then(() => {
											const channelId = serverData.Channels.BotLog;
											if (channelId.length && payload.guild.channels.has(channelId)) {
												payload.guild.channels
													.get(channelId)
													.createMessage({
														embeds: [
															baseManager.succesMessage(
																executor,
																Math.floor(Date.now() / 1000),
																'Usuario excedio el limite de emojis creados en un corto periodo de tiempo.',
																memberDm
															),
														],
													})
													.catch(() => null);
											}
										});
								})
								.catch(() => null);
							this.delete(`${payload.guildId}.${executor.id}`);
							return;
						}
						baseManager.addOne(payload.guildId, executor, this);
					} else {
						baseManager.addOne(payload.guildId, executor, this);
					}
				} else return;
			}
		);
	}

	async fetchExecutor(guildId: string, emojiId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.EMOJI_CREATE })
			.then((log) => log.find((entry) => entry.targetId === emojiId))
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

class GuildEmojiDelete extends Collections.BaseCollection<string, number> {
	constructor() {
		super();
		Client.on(
			ClientEvents.GUILD_EMOJIS_UPDATE,
			async (payload: GatewayClientEvents.GuildEmojisUpdate) => {
				const deletedEmojis = payload.differences.deleted;
				if (deletedEmojis.size) {
					const serverData = CacheCollection.get(payload.guildId);
					if (!baseManager.onBeforeAll(payload.guildId, 'maxDeletedEmojis')) return;
					const executor = await this.fetchExecutor(payload.guildId, deletedEmojis.first().id);
					if (!executor) return;
					const data = this.get(`${payload.guildId}.${executor.id}`);
					if (data) {
						if (data >= serverData.Modules.AntiNuker.Config['maxDeletedEmojis'].Limit) {
							if (!baseManager.onBefore(payload.guildId, executor))
								return this.delete(`${payload.guildId}.${executor.id}`);
							executor
								.ban({
									reason: '[Antinuke] Usuario excedio el limite de emojis eliminados.',
								})
								.then(() => {
									let memberDm: boolean = true;
									if (executor.bot) memberDm = false;
									executor
										.createMessage({
											embeds: [
												baseManager.DmMessage(
													payload.guild,
													Math.floor(Date.now() / 1000),
													'Usuario excedio el limite de emojis eliminados en un corto periodo de tiempo.'
												),
											],
										})
										.catch(() => (memberDm = false))
										.then(() => {
											const channelId = serverData.Channels.BotLog;
											if (channelId.length && payload.guild.channels.has(channelId)) {
												payload.guild.channels
													.get(channelId)
													.createMessage({
														embeds: [
															baseManager.succesMessage(
																executor,
																Math.floor(Date.now() / 1000),
																'Usuario excedio el limite de emojis eliminados en un corto periodo de tiempo.',
																memberDm
															),
														],
													})
													.catch(() => null);
											}
										});
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
			}
		);
	}

	async fetchExecutor(guildId: string, emojiId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.EMOJI_DELETE })
			.then((log) => log.find((entry) => entry.targetId === emojiId))
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

export const guildEmojiDelete = new GuildEmojiDelete();
export const guildEmojiCreate = new GuildEmojiCreate();
