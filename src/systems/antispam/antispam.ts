import { Collections, GatewayClientEvents, Structures } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import { Embed } from 'detritus-client/lib/utils';
import CacheCollection from '../../cache/CacheCollection';
import Client from '../../client';
import { DiscordEmojis, EmbedColors } from '../../utils/constants';
import { canTimeout, timeoutMember } from '../../utils/functions';
import { ServerConfig } from '../../utils/types';
let reasons = {
	Flood: 'Envio de mensajes flood',
	Caps: 'Envio de mensajes con muchas mayusculas',
	WallText: 'Envio de muros de texto',
	Link: 'Envio de enlaces/invitaciones',
	BanWord: 'Envio de palabras baneadas',
};
type modules = {
	Antiflood: number;
	Automod: number;
	Antiwalltext: number;
	Anticaps: number;
	Antilinks: number;
};
type words = {
	Word: string;
	Percent: number;
}[];
class AntispamManager {
	percents: Collections.BaseCollection<string, modules>;
	messages: Collections.BaseCollection<string, Structures.Message[]>;
	constructor() {
		this.percents = new Collections.BaseCollection<string, modules>();
		this.messages = new Collections.BaseCollection<string, Structures.Message[]>();
		Client.on(ClientEvents.MESSAGE_CREATE, async (payload: GatewayClientEvents.MessageCreate) => {
			let { message } = payload;
			if (!message.guild) return;
			if (message.member?.id === Client.userId) return;
			if (message.guildId !== '920792338245230631') return;
			const serverData = CacheCollection.get(message.guildId);
			await this.removeSpam(message, serverData);
		});
	}
	hasImmunity(
		member: Structures.Member,
		channel: Structures.ChannelGuildText,
		module: string,
		serverData: ServerConfig
	): boolean {
		if (!canTimeout(member.guild, member)) return true;
		if (member.canAdministrator) return true;
		let whitelist = serverData.Modules[module].Whitelist;
		if (serverData.Users.Trusted.includes(member.id)) return true;
		if (whitelist.Users.includes(member.id)) return true;
		if (whitelist.Channels.includes(channel.id)) return true;
		for (let role of whitelist.Roles) {
			if (member.roles.has(role)) return true;
		}
		return false;
	}
	async removeSpam(message: Structures.Message, serverData: ServerConfig) {
		if (this.isFlood(message, this.percents, serverData)) {
			timeoutMember({
				member: message.member,
				reason: `[Antispam] ${reasons['Flood']}`,
				time: 300000,
			});
			let memberMessages = this.messages.get(`${message.guildId}.${message.member.id}`);
			let messagesToDelete: string[] = memberMessages.map((message) => message.id);
			if (messagesToDelete.length === 1)
				await message.channel.deleteMessage(messagesToDelete[0], {
					reason: `[Antispam] Borrando flood`,
				});
			else await message.channel.bulkDelete(messagesToDelete);
			memberMessages = [];
			return this.sendLog(message, reasons['Flood']);
		}
		if (this.isLink(message, serverData.Modules.AntiLinks.AllowImages)) {
			let { Enabled } = serverData.Modules.AntiLinks;
			if (!Enabled) return false;
			if (this.maxLinks(message, this.percents, serverData)) {
				message.delete({ reason: `[Antispam] ${reasons['Link']}` }).catch(() => null);
				timeoutMember({
					member: message.member,
					reason: `[Antispam] ${reasons['Link']}`,
					time: 300000,
				});
				return this.sendLog(message, reasons['Link']);
			}
			return message.delete({ reason: `[Antispam] ${reasons['Link']}` }).catch(() => null);
		}
		if (this.isbannedWord(message, serverData.Modules.Automod.Words)) {
			let { Enabled } = serverData.Modules.Automod;
			if (!Enabled) return false;
			if (this.maxBannedWord(message, this.percents, serverData)) {
				message.delete({ reason: `[Antispam] ${reasons['BanWord']}` }).catch(() => null);
				timeoutMember({
					member: message.member,
					reason: `[Antispam] ${reasons['BanWord']}`,
					time: 300000,
				});
				return this.sendLog(message, reasons['BanWord']);
			}
			return message.delete({ reason: `[Antispam] ${reasons['BanWord']}` }).catch(() => null);
		}
		if (this.isWallText(message, serverData.Modules.AntiWallText.Limit)) {
			let { Enabled } = serverData.Modules.AntiWallText;
			if (!Enabled) return false;
			if (this.maxWallText(message, this.percents, serverData)) {
				message.delete({ reason: `[Antispam] ${reasons['WallText']}` }).catch(() => null);
				timeoutMember({
					member: message.member,
					reason: `[Antispam] ${reasons['WallText']}`,
					time: 300000,
				});
				return this.sendLog(message, reasons['WallText']);
			}
			return message.delete({ reason: `[Antispam] ${reasons['WallText']}` }).catch(() => null);
		}
		if (this.isCAPS(message, serverData.Modules.AntiCaps.Limit)) {
			let { Enabled } = serverData.Modules.AntiCaps;
			if (!Enabled) return false;
			if (this.maxCaps(message, this.percents, serverData)) {
				message.delete({ reason: `[Antispam] ${reasons['Caps']}` }).catch(() => null);
				timeoutMember({
					member: message.member,
					reason: `[Antispam] ${reasons['Caps']}`,
					time: 300000,
				});
				return this.sendLog(message, reasons['Caps']);
			}
			return message.delete({ reason: `[Antispam] ${reasons['Caps']}` }).catch(() => null);
		}
	}

	isFlood(
		message: Structures.Message,
		cache: Collections.BaseCollection<string, modules>,
		serverData: ServerConfig
	): boolean {
		let { Percent, PercentTimeLimit, Enabled } = CacheCollection.get(message.guildId).Modules
			.AntiFlood;
		if (!Enabled) return false;
		if (
			this.hasImmunity(
				message.member,
				message.channel as Structures.ChannelGuildText,
				'AntiFlood',
				serverData
			)
		)
			return false;
		let data = cache.get(`${message.member.guildId}.${message.member.id}`);
		if (!data) data = this.createDefaultPercent(message.member, cache);
		let messages = this.messages.get(`${message.member.guildId}.${message.member.id}`);
		if (!messages) messages = this.createDefaultData(message.member, this.messages);
		messages.push(message);
		data.Antiflood += Percent;
		if (data.Antiflood >= 100) {
			data.Antiflood = 0;
			return true;
		}
		setTimeout(() => {
			data.Antiflood = 0;
		}, PercentTimeLimit * 1000);
		return false;
	}
	maxCaps(
		message: Structures.Message,
		cache: Collections.BaseCollection<string, modules>,
		serverData: ServerConfig
	): boolean {
		let { Limit, Percent, PercentTimeLimit, Enabled } = serverData.Modules.AntiCaps;
		if (!this.isCAPS(message, Limit)) return false;
		if (!Enabled) return false;
		if (
			this.hasImmunity(
				message.member,
				message.channel as Structures.ChannelGuildText,
				'AntiCaps',
				serverData
			)
		)
			return false;
		let data = cache.get(`${message.member.guildId}.${message.member.id}`);
		if (!data) data = this.createDefaultPercent(message.member, cache);
		data.Anticaps += Percent;
		if (data.Anticaps >= 100) {
			data.Anticaps = 0;
			return true;
		}
		setTimeout(() => {
			data.Anticaps = 0;
		}, PercentTimeLimit * 1000);
		return false;
	}
	isCAPS(message: Structures.Message, limit: number) {
		if (!message.content.length) return false;
		if (message.content.match(/[A-Z]/g) === null) return false;
		if (!(message.content.match(/[A-Z]/g).length >= limit)) return false;
		return true;
	}
	isWallText(message: Structures.Message, limit: number) {
		if (!message.content.length) return false;
		if (!(message.content.length >= limit)) return false;
		return true;
	}
	maxWallText(
		message: Structures.Message,
		cache: Collections.BaseCollection<string, modules>,
		serverData: ServerConfig
	): boolean {
		let { Limit, Percent, PercentTimeLimit, Enabled } = serverData.Modules.AntiWallText;
		if (!Enabled) return false;
		if (!this.isWallText(message, Limit)) return false;
		if (
			this.hasImmunity(
				message.member,
				message.channel as Structures.ChannelGuildText,
				'AntiWallText',
				serverData
			)
		)
			return false;
		let data = cache.get(`${message.member.guildId}.${message.member.id}`);
		if (!data) data = this.createDefaultPercent(message.member, cache);
		data.Antiwalltext += Percent;
		if (data.Antiwalltext >= 100) {
			data.Antiwalltext = 0;
			return true;
		}
		setTimeout(() => {
			data.Antiwalltext = 0;
		}, PercentTimeLimit * 1000);
		return false;
	}
	isLink(message: Structures.Message, allowImages: boolean) {
		if (!message.content.length) return false;
		if (
			allowImages &&
			message.content.match(process.env.mediaRegex)
		)
			return false;
		if (
			!message.content.match(process.env.linkRegex) 
		)
			return false;
		return true;
	}
	maxLinks(
		message: Structures.Message,
		cache: Collections.BaseCollection<string, modules>,
		serverData: ServerConfig
	): boolean {
		let { AllowImages, Percent, PercentTimeLimit, Enabled } = serverData.Modules.AntiLinks;
		if (!this.isLink(message, AllowImages)) return false;
		if (!Enabled) return false;
		if (
			this.hasImmunity(
				message.member,
				message.channel as Structures.ChannelGuildText,
				'AntiLinks',
				serverData
			)
		)
			return false;
		let data = cache.get(`${message.member.guildId}.${message.member.id}`);
		if (!data) data = this.createDefaultPercent(message.member, cache);
		data.Antilinks += Percent;
		if (data.Antilinks >= 100) {
			data.Antilinks = 0;
			return true;
		}
		setTimeout(() => {
			data.Antilinks = 0;
		}, PercentTimeLimit * 1000);
		return false;
	}
	isbannedWord(message: Structures.Message, Words: words): number | null {
		if (!message.content.length) return null;
		if (!Words.length) return null;
		const wordInfo = Words.find(({ Word }) =>
			message.content.toLowerCase().includes(Word.toLowerCase())
		);
		if (wordInfo) return wordInfo.Percent;
		return null;
	}
	maxBannedWord(
		message: Structures.Message,
		cache: Collections.BaseCollection<string, modules>,
		serverData: ServerConfig
	): boolean {
		let { PercentTimeLimit, Enabled, Words } = serverData.Modules.Automod;
		const Percent = this.isbannedWord(message, Words);
		if (!Percent) return false;
		if (!Enabled) return false;
		if (
			this.hasImmunity(
				message.member,
				message.channel as Structures.ChannelGuildText,
				'Automod',
				serverData
			)
		)
			return false;
		let data = cache.get(`${message.member.guildId}.${message.member.id}`);
		if (!data) data = this.createDefaultPercent(message.member, cache);
		data.Automod += Percent;
		if (data.Automod >= 100) {
			data.Automod = 0;
			return true;
		}
		setTimeout(() => {
			data.Automod = 0;
		}, PercentTimeLimit * 1000);
		return false;
	}

	sendLog(message: Structures.Message, alert: string) {
		let embedDm = new Embed();
		embedDm.setTitle(`${DiscordEmojis.TIMEOUT} Antispam Report:`);
		embedDm.setColor(EmbedColors.MAIN);
		embedDm.setThumbnail(message.member.guild.iconUrl);
		embedDm.setDescription(
			`Has sido aislado temporalmente de \`${message.member.guild.name}\`\n**Duración:** \`5m\`\n**Motivo:** \`${alert}\``
		);
		embedDm.setTimestamp();
		let memberDm = true;
		message.member
			.createMessage({ embeds: [embedDm] })
			.catch(() => (memberDm = false))
			.then(() => {
				let embed = new Embed()
					.setTitle('Antispam')
					.setDescription(
						`${DiscordEmojis.TIMEOUT} \`${message.member.tag}\` ha sido aislado temporalmente por 5m`
					)
					.setFooter('El usuario fue notificado por DMs')
					.setColor(EmbedColors.BLANK);
				message.channel.createMessage({ embeds: [embed] });
				this.sendBotlog(message, memberDm, alert);
			});
	}
	sendBotlog(message: Structures.Message, memberDm: boolean, reason: string) {
		let serverData = CacheCollection.get(message.guildId);
		const channelId = serverData.Channels.BotLog;
		if (channelId.length && message.guild.channels.has(channelId)) {
			const embed = new Embed();
			embed.setTitle(`${DiscordEmojis.TIMEOUT} Antispam Report:`);
			embed.setColor(EmbedColors.MAIN);
			embed.setThumbnail(message.member.avatarUrl);
			embed.setDescription(
				`${message.member.mention} | \`${
					message.member.id
				}\` ha sido aislado temporalmente\n**Duración:** \`5m\`\n**Motivo:** \`${reason}\`\n\n**Mas detalles:**\n${
					DiscordEmojis.CHAT
				} Canal: ${message.channel.mention} | \`${message.channel.id}\`\n${
					DiscordEmojis.CLOCK
				} Fecha: <t:${Math.floor(Date.now() / 1000)}:R>\n${
					DiscordEmojis.BLOCKUSER
				} Usuario avisado: ${memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO}`
			);
			return message.guild.channels.get(channelId).createMessage({ embeds: [embed] });
		}
	}
	createDefaultPercent(
		member: Structures.Member,
		cache: Collections.BaseCollection<string, modules>
	) {
		const hasData = cache.has(`${member.guildId}.${member.id}`);
		if (hasData) {
			return cache.get(`${member.guildId}.${member.id}`);
		} else {
			return cache
				.set(`${member.guildId}.${member.id}`, {
					Antiflood: 0,
					Automod: 0,
					Antiwalltext: 0,
					Anticaps: 0,
					Antilinks: 0,
				})
				.get(`${member.guildId}.${member.id}`);
		}
	}
	createDefaultData(
		member: Structures.Member,
		cache: Collections.BaseCollection<string, Structures.Message[]>
	) {
		const hasData = cache.has(`${member.guildId}.${member.id}`);
		if (hasData) {
			return cache.get(`${member.guildId}.${member.id}`);
		} else {
			return cache
				.set(`${member.guildId}.${member.id}`, [])
				.get(`${member.guildId}.${member.id}`);
		}
	}
}

export const antispamManager = new AntispamManager();
