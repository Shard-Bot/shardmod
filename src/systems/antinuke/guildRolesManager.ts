import { Collections, GatewayClientEvents } from 'detritus-client';
import { AuditLogActions, ClientEvents } from 'detritus-client/lib/constants';
import Client from '../../client';
import CacheCollection from '../../cache/CacheCollection';
import baseManager from './baseManager';

class GuildRoleCreate extends Collections.BaseCollection<string, number> {
	bans: Collections.BaseCollection<string, number>;
	constructor() {
		super();
		this.bans = new Collections.BaseCollection<string, number>();
		Client.on(
			ClientEvents.GUILD_ROLE_CREATE,
			async (payload: GatewayClientEvents.GuildRoleCreate) => {
				if (!(await baseManager.onBeforeAll(payload.guildId, 'maxCreatedRoles'))) return;
				const serverData = await CacheCollection.getOrFetch(payload.guildId);
				const executor = await this.fetchExecutor(payload.guildId, payload.role.id);
				if (!executor) return;
				if(this.bans.has(`${payload.guildId}.${executor.id}`)) return;
				const data = this.get(`${payload.guildId}.${executor.id}`);
				if (data) {
					if (data >= serverData.Modules.AntiNuker.Config['maxCreatedRoles'].Limit) {
						if (!(await baseManager.onBefore(payload.guildId, executor)))
							return this.delete(`${payload.guildId}.${executor.id}`);
						executor
							.ban({ reason: '[Antinuke] Usuario excedio el limite de roles creados.' })
							.then(() => {
								let memberDm: boolean = true;
								if (executor.bot) memberDm = false;
								if(this.bans.has(`${payload.guildId}.${executor.id}`)) return;
								executor
									.createMessage({
										embeds: [
											baseManager.DmMessage(
												payload.guild,
												new Date().getTime() / 1000,
												'Usuario excedio el limite de roles creados en un corto periodo de tiempo.'
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
															new Date().getTime() / 1000,
															'Usuario excedio el limite de roles creados en un corto periodo de tiempo.',
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

	async fetchExecutor(guildId: string, roleId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.ROLE_CREATE })
			.then((log) => log.find((entry) => entry.targetId === roleId))
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

class GuildRoleDelete extends Collections.BaseCollection<string, number> {
	bans: Collections.BaseCollection<string, number>;
	constructor() {
		super();
		this.bans = new Collections.BaseCollection<string, number>();
		Client.on(
			ClientEvents.GUILD_ROLE_DELETE,
			async (payload: GatewayClientEvents.GuildRoleDelete) => {
				if(!payload.role) return;
				if (!(await baseManager.onBeforeAll(payload.guildId, 'maxDeletedRoles'))) return;
				const serverData = await CacheCollection.getOrFetch(payload.guildId);
				const executor = await this.fetchExecutor(payload.guildId, payload.role.id);
				if (!executor) return;
				if(this.bans.has(`${payload.guildId}.${executor.id}`)) return;
				const data = this.get(`${payload.guildId}.${executor.id}`);
				if (data) {
					if (data >= serverData.Modules.AntiNuker.Config['maxDeletedRoles'].Limit) {
						if (!(await baseManager.onBefore(payload.guildId, executor)))
							return this.delete(`${payload.guildId}.${executor.id}`);
						executor
							.ban({ reason: '[Antinuke] Usuario excedio el limite de roles eliminados.' })
							.then(() => {
								let memberDm: boolean = true;
								if (executor.bot) memberDm = false;
								if(this.bans.has(`${payload.guildId}.${executor.id}`)) return;
								executor
									.createMessage({
										embeds: [
											baseManager.DmMessage(
												payload.guild,
												Math.floor(Date.now() / 1000),
												'Usuario excedio el limite de roles eliminados en un corto periodo de tiempo.'
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
															'Usuario excedio el limite de roles eliminados en un corto periodo de tiempo.',
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

	async fetchExecutor(guildId: string, roleId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.ROLE_DELETE })
			.then((log) => log.find((entry) => entry.targetId === roleId))
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
export const guildRoleCreate = new GuildRoleCreate();
export const guildRoleDelete = new GuildRoleDelete();
