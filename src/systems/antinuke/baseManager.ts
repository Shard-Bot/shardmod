import { Collections, Structures } from 'detritus-client';
import { Embed } from 'detritus-client/lib/utils';
import CacheCollection from '../../cache/CacheCollection';
import Client from '../../client';
import { DiscordEmojis, EmbedColors } from '../../utils/constants';

class CacheManager {
	client = Client;
	constructor() {
		this.client = Client;
	}
	addOne(
		guildId: string,
		member: Structures.Member,
		cache: Collections.BaseCollection<string, number>
	) {
		const data = cache.get(`${guildId}.${member.id}`);
		if (data) {
			cache.set(`${guildId}.${member.id}`, data + 1);
			setTimeout(() => {
				cache.delete(`${guildId}.${member.id}`);
			}, 300000);
		} else {
			cache.set(`${guildId}.${member.id}`, 1);
			setTimeout(() => {
				cache.delete(`${guildId}.${member.id}`);
			}, 300000);
		}
	}
	removeAll(
		guildId: string,
		member: Structures.Member,
		cache: Collections.BaseCollection<string, number>
	) {
		cache.delete(`${guildId}.${member.id}`);
	}
	hasImmunity(guildId: string, member: Structures.Member) {
		const guildData = CacheCollection.get(guildId);
		if (guildData.Users.Trusted.includes(member.id)) return true;
		if (guildData.Modules.AntiNuker.Whitelist.Users.includes(member.id)) return true;
		for (let role of guildData.Modules.AntiNuker.Whitelist.Roles) {
			if (member.roles.has(role)) return true;
		}
		return false;
	}
	canBan(guildId: string, member: Structures.Member) {
		if (
			this.client.guilds.get(guildId).me.canEdit(member) &&
			this.client.guilds.get(guildId).me.canBanMembers
		)
			return true;
		return false;
	}
	onBeforeAll(guildId: string, event: string) {
		const guildData = CacheCollection.get(guildId);
		if (!guildData.Modules.AntiNuker.Enabled) return false;
		if (!guildData.Modules.AntiNuker.Config[event].Enabled) return false;
		if(!this.client.guilds.get(guildId).me.canAdministrator) return false;
		return true;
	}
	onBefore(guildId: string, member: Structures.Member) {
		if (member.id === this.client.clientId) return false;
		if (this.client.guilds.get(guildId).ownerId === member.id) return false;
		if (this.hasImmunity(guildId, member)) return false;
		if (!this.canBan(guildId, member)) return false;
		return true;
	}
	DmMessage(guild: Structures.Guild, timestamp: number, reason: string) {
		const embed = new Embed();
		embed.setTitle('Antinuke Report');
		embed.setColor(EmbedColors.MAIN);
		embed.setThumbnail(guild.iconUrl);
		embed.setDescription(`**Has sido baneado de ${guild.name}!**`);
		embed.addField(
			'\u200b',
			`${DiscordEmojis.SERVER} **Servidor:** ${guild.name} | \`${guild.id}\``
		);
		embed.addField('\u200b', `${DiscordEmojis.DOCUMENT} **Razón:** \`${reason}\``);
		embed.addField('\u200b', `${DiscordEmojis.CLOCK} **Hora:** <t:${timestamp}:R>`);
		return embed;
	}
	succesMessage(
		executor: Structures.Member,
		timestamp: number,
		reason: string,
		memberDm: boolean
	) {
		const embed = new Embed();
		embed.setTitle('Antinuke Alert');
		embed.setColor(EmbedColors.MAIN);
		embed.setThumbnail(executor.avatarUrl);
		embed.setDescription(`**${executor.tag} Activo el Antinuke!**`);
		embed.addField(
			'\u200b',
			`${DiscordEmojis.MEMBER} **Usuario:** ${executor.mention} | \`${executor.id}\``
		);
		embed.addField('\u200b', `${DiscordEmojis.DOCUMENT} **Razón:** \`${reason}\``);
		embed.addField('\u200b', `${DiscordEmojis.CLOCK} **Hora:** <t:${timestamp}:R>`);
		embed.addField(
			`Mas detalles:`,
			`${DiscordEmojis.SPACE} ${DiscordEmojis.BLOCKUSER} **Ejecutor Baneado:** ${
				DiscordEmojis.CHECK
			}\n${DiscordEmojis.SPACE} ${DiscordEmojis.MAIL} **Aviso al ejecutor:** ${
				memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO
			}`
		);
		return embed;
	}
}

export default new CacheManager();
