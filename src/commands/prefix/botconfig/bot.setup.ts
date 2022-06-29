import { Command, CommandClient, Structures } from 'detritus-client';
import {
	ChannelTypes,
	MessageComponentButtonStyles,
	OverwriteTypes,
	Permissions,
} from 'detritus-client/lib/constants';
import { Components, Embed } from 'detritus-client/lib/utils';
import CacheCollection from '../../../cache/CacheCollection';
import { Model } from '../../../schemas/serverconfig';
import { DiscordEmojis, EmbedColors } from '../../../utils/constants';
import { BaseCommand } from '../basecommand';

export const COMMAND_NAME = 'setup';

export default class TrustedAddCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['bot setup'],
			disableDm: true,
			metadata: {
				trustedOnly: true,
				description: 'Inicia un setup para autoconfigurar el bot',
				example: [COMMAND_NAME],
				type: 'botConfig',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}

	async run(context: Command.Context) {
		const wait = (ms) => new Promise((res) => setTimeout(res, ms));
		let description: string[] = [];
		description.push('**Iniciando Shard setup**');
		let embed = new Embed()
			.setColor(EmbedColors.MAIN)
			.setTitle('Bot Setup')
			.setTimestamp()
			.setDescription(`${description.join('\n')}`);
		const components = new Components();
		components.createButton({
			style: MessageComponentButtonStyles.LINK,
			label: 'Documentacion',
			url: 'https://docs.shardbot.xyz',
			emoji: DiscordEmojis.RULES,
		});
		context.editOrReply({ embeds: [embed] });
		await wait(2000);
		description.push(`Verificando Permisos ${DiscordEmojis.LOADING}`);
		embed.setDescription(`${description.join('\n')}`);
		context.editOrReply({ embeds: [embed] });
		await wait(2000);
		if (!this.havePermissions(context)) {
			description.pop();
			description.push(
				`Verificando Permisos ${DiscordEmojis.CHECK_NO}: \`No poseo el permiso Administrador, sin este permiso mis sistemas no funcionaran correctamente\``
			);
			embed.setDescription(`${description.join('\n')}`);
			return context.editOrReply({ embeds: [embed] });
		}
		description.pop();
		description.push(
			`Verificando Permisos ${DiscordEmojis.CHECK}`,
			`Verificando jerarquia ${DiscordEmojis.LOADING}`
		);
		embed.setDescription(`${description.join('\n')}`);
		context.editOrReply({ embeds: [embed] });
		await wait(2000);
		if (!this.haveHierarchy(context)) {
			description.pop();
			description.push(
				`Verificando jerarquia ${DiscordEmojis.CHECK_NO}: \`No poseo jerarquia alta, para que mis sistemas funcionen correctamente sube mi rol lo mas alto posible.\``
			);
			embed.setDescription(`${description.join('\n')}`);
			return context.editOrReply({ embeds: [embed] });
		}
		description.pop();
		description.push(
			`Verificando jerarquia ${DiscordEmojis.CHECK}`,
			`Verificando si existe una categoria de logs ${DiscordEmojis.LOADING}`
		);
		embed.setDescription(`${description.join('\n')}`);
		context.editOrReply({ embeds: [embed] });
		await wait(2000);
		let logsCategory = this.shardCategory(context);
		if (!logsCategory) {
			description.pop();
			description.push(
				`Verificando si existe una categoria de logs ${DiscordEmojis.CHECK_NO}\n${DiscordEmojis.REPLY}Creando categoria de logs ${DiscordEmojis.LOADING}`
			);
			embed.setDescription(`${description.join('\n')}`);
			context.editOrReply({ embeds: [embed] });
			await wait(2000);
			const newCategory = await this.createShardCategory(context);
			logsCategory = newCategory;
			description.pop();
			description.push(
				`Verificando si existe una categoria de logs ${DiscordEmojis.CHECK_NO}\n${DiscordEmojis.REPLY}Categoria de logs creada ${DiscordEmojis.CHECK}`,
				`Verificando si existen canales de logs ${DiscordEmojis.LOADING}`
			);
			embed.setDescription(`${description.join('\n')}`);
			context.editOrReply({ embeds: [embed] });
		} else {
			description.pop();
			description.push(
				`Verificando si existe una categoria de logs ${DiscordEmojis.CHECK}`,
				`Verificando si existen canales de logs ${DiscordEmojis.LOADING}`
			);
		}
		embed.setDescription(`${description.join('\n')}`);
		context.editOrReply({ embeds: [embed] });
		await wait(2000);
		let channels: Structures.Channel[] = [];
		if (!(await this.logsChannelsExits(context))) {
			description.pop();
			description.push(
				`Verificando si existen canales de logs ${DiscordEmojis.CHECK_NO}\n${DiscordEmojis.REPLY}Creando canales de logs ${DiscordEmojis.LOADING}`
			);
			embed.setDescription(`${description.join('\n')}`);
			context.editOrReply({ embeds: [embed] });
			await wait(2000);
			const botlog = await this.botLogChannel(context);
			const mod = await this.modLogChannel(context);
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{ $set: { [`Channels.BotLog`]: botlog.id } }
			);
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{ $set: { [`Channels.ModLog`]: mod.id } }
			);
			await channels.push(mod, botlog);
			description.pop();
			description.push(
				`Verificando si existen canales de logs ${DiscordEmojis.CHECK_NO}\n${DiscordEmojis.REPLY}Canales de logs creados ${DiscordEmojis.CHECK}`,
				`Verificando si los canales estan sincronizados con la categoria de logs ${DiscordEmojis.LOADING}`
			);
			embed.setDescription(`${description.join('\n')}`);
			context.editOrReply({ embeds: [embed] });
		} else {
			description.pop();
			const modlog = await this.getLogChannels(context, 'mod-log');
			const botlog = await this.getLogChannels(context, 'bot-log');
			channels.push(modlog, botlog);
			description.push(
				`Verificando si existen canales de logs ${DiscordEmojis.CHECK}`,
				`Verificando si los canales estan sincronizados con la categoria de logs ${DiscordEmojis.LOADING}`
			);
		}
		embed.setDescription(`${description.join('\n')}`);
		context.editOrReply({ embeds: [embed] });
		await wait(2000);
		if (channels.some((ch) => !ch.isSyncedWithParent)) {
			description.pop();
			description.push(
				`Verificando si los canales estan sincronizados con la categoria de logs ${DiscordEmojis.CHECK_NO}\n${DiscordEmojis.REPLY}Sincronizando canales de logs ${DiscordEmojis.LOADING}`
			);
			embed.setDescription(`${description.join('\n')}`);
			context.editOrReply({ embeds: [embed] });
			await wait(2000);
			channels.forEach(
				async (ch) =>
					await this.syncChannel(
						ch as Structures.ChannelGuildText,
						logsCategory as Structures.ChannelGuildCategory
					)
			);
			description.pop();
			description.push(
				`Verificando si los canales estan sincronizados con la categoria de logs ${DiscordEmojis.CHECK_NO}\n${DiscordEmojis.REPLY}Canales de logs sincronizados ${DiscordEmojis.CHECK}`,
				`\n**Setup Finalizado**\n*Para terminar de configurar el bot completamente a tu gusto checa la guia pulsando el boton de abajo*`
			);
			embed.setDescription(`${description.join('\n')}`);
			return context.editOrReply({ embeds: [embed], components: components });
		} else {
			description.pop();
			description.push(
				`Verificando si los canales estan sincronizados con la categoria de logs ${DiscordEmojis.CHECK}`,
				`\n**Setup Finalizado**\n*Para terminar de configurar el bot completamente a tu gusto checa la guia pulsando el boton de abajo*`
			);
			embed.setDescription(`${description.join('\n')}`);
			return context.editOrReply({ embeds: [embed], components: components });
		}
	}
	havePermissions(context: Command.Context) {
		return context.guild.me.canAdministrator;
	}
	haveHierarchy(context: Command.Context) {
		let minPosition = 4;
		if (context.guild.roles.length <= 6) minPosition = 2;
		if (
			context.guild.me.highestRole.position <
			context.guild.roles.length - minPosition
		)
			return false;
		return true;
	}
	shardCategory(context: Command.Context) {
		return (
			context.guild.channels.find(
				(channel) =>
					channel.name.toLowerCase().includes('shard logs') &&
					channel.type === ChannelTypes.GUILD_CATEGORY
			) || null
		);
	}
	async getLogChannels(context: Command.Context, channelType: string) {
		if (channelType === 'mod-log') {
			return (
				context.guild.channels.get(
					(await CacheCollection.getOrFetch(context.guildId)).Channels.ModLog
				) ||
				context.guild.channels.find(
					(channel) =>
						channel.name.toLowerCase().includes('mod-log') &&
						channel.type === ChannelTypes.GUILD_TEXT
				)
			);
		}
		return (
			context.guild.channels.get(
				(await CacheCollection.getOrFetch(context.guildId)).Channels.BotLog
			) ||
			context.guild.channels.find(
				(channel) =>
					channel.name.toLowerCase().includes('bot-log') &&
					channel.type === ChannelTypes.GUILD_TEXT
			)
		);
	}
	async logsChannelsExits(context: Command.Context) {
		const botLogChannel = await this.getLogChannels(context, 'bot-log');
		const modLogChannel = await this.getLogChannels(context, 'mod-log');
		if (botLogChannel && modLogChannel) {
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{ $set: { [`Channels.BotLog`]: botLogChannel.id } }
			);
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{ $set: { [`Channels.ModLog`]: modLogChannel.id } }
			);
			return true
		}
		return false;
	}
	async modLogChannel(context: Command.Context) {
		const channel = await this.getLogChannels(context, 'mod-log');
		if (channel) return channel;
		return await context.guild.createChannel({
			name: 'mod-log',
			type: ChannelTypes.GUILD_TEXT,
		});
	}
	async botLogChannel(context: Command.Context) {
		const channel = await this.getLogChannels(context, 'bot-log');
		if (channel) return channel;
		return await context.guild.createChannel({
			name: 'bot-log',
			type: ChannelTypes.GUILD_TEXT,
		});
	}
	async createShardCategory(context: Command.Context) {
		let permissions = {
			id: context.guild.roles.find((r) => r.name === '@everyone').id,
			deny: 1024,
			allow: 0,
			type: OverwriteTypes.ROLE,
		};
		const channel = context.guild.channels.find(
			(channel) =>
				channel.name.toLowerCase().includes('Shard Logs') &&
				channel.type === ChannelTypes.GUILD_CATEGORY
		);
		if (channel) return await channel.edit({ permissionOverwrites: [permissions] });
		return await context.guild.createChannel({
			name: 'Shard Logs',
			type: ChannelTypes.GUILD_CATEGORY,
			reason: 'Bot setup',
			permissionOverwrites: [permissions],
		});
	}
	async syncChannel(
		channel: Structures.ChannelGuildText,
		category: Structures.ChannelGuildCategory
	) {
		await channel.edit({ parentId: category.id });
		let categoryPermission = category.permissionOverwrites.find(
			({ id }) => id === channel.guild.roles.find((r) => r.name === '@everyone').id
		);
		let permissions = {
			id: categoryPermission.id,
			deny: Number(categoryPermission.deny),
			allow: Number(categoryPermission.allow),
			type: OverwriteTypes.ROLE,
		};
		channel.edit({ permissionOverwrites: [permissions] });
	}
}
