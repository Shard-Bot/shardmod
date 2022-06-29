import { Collections, GatewayClientEvents, Structures } from 'detritus-client';
import { AuditLogActions, ClientEvents } from 'detritus-client/lib/constants';
import Client from '../../client';
import CacheCollection from '../../cache/CacheCollection';
import baseManager from './baseManager';

class GuildKicksManager extends Collections.BaseCollection<string, number> {
	bans: Collections.BaseCollection<string, number>;
	constructor() {
		super();
		this.bans = new Collections.BaseCollection<string, number>();
		Client.on(
			ClientEvents.GUILD_MEMBER_REMOVE,
			async (payload: GatewayClientEvents.GuildMemberRemove) => {
				if(!payload.member || !payload.guildId) return;
				if (!(await baseManager.onBeforeAll(payload.guildId, 'maxKicks'))) return;
				const serverData = await CacheCollection.getOrFetch(payload.guildId);
				const executor = await this.fetchExecutor(payload.guildId, payload.member.id);
				if (!executor) return;
				if(this.bans.has(`${payload.guildId}.${executor.id}`)) return;
				const data = this.get(`${payload.guildId}.${executor.id}`);
				if (data) {
					if (data >= serverData.Modules.AntiNuker.Config['maxKicks'].Limit) {
						if (!(await baseManager.onBefore(payload.guildId, executor)))
							return this.delete(`${payload.guildId}.${executor.id}`);
						const isbanned = await Client.rest
							.fetchGuildBans(payload.guildId)
							.then((log) => log.find((entry) => entry.user.id === payload.userId))
							.then(async (entry) => {
								if (entry) return true;
								return false;
							});
						if (isbanned) return;
						executor
							.ban({ reason: '[Antinuke] Usuario excedio el limite de expulsiones.' })
							.then(() => {
								let memberDm: boolean = true;
								if (executor.bot) memberDm = false;
								if(this.bans.has(`${payload.guildId}.${executor.id}`)) return;
								executor
									.createMessage({
										embeds: [
											baseManager.DmMessage(
												payload.member.guild,
												Math.floor(Date.now() / 1000),
												'Usuario excedio el limite de expulsiones en un corto periodo de tiempo.'
											),
										],
									})
									.catch(() => (memberDm = false))
									.then(() => {
										const channelId = serverData.Channels.BotLog;
										if (
											channelId.length &&
											payload.member.guild.channels.has(channelId)
										) {
											payload.member.guild.channels
												.get(channelId)
												.createMessage({
													embeds: [
														baseManager.succesMessage(
															executor,
															Math.floor(Date.now() / 1000),
															'Usuario excedio el limite de expulsiones en un corto periodo de tiempo.',
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

	async fetchExecutor(guildId: string, userId: string) {
		return Client.rest
			.fetchGuildAuditLogs(guildId, { actionType: AuditLogActions.MEMBER_KICK })
			.then((log) => log.find((entry) => entry.targetId === userId))
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

export const guildKicksManager = new GuildKicksManager();
