import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Channel } from 'detritus-client/lib/structures';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import { getGuildChannel, getUserByText } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import { Confirmation } from '../../../utils/confirm';
import { Snowflake } from 'detritus-client/lib/utils';

export const COMMAND_NAME = 'clear';
type param = {
	from: string | Structures.Member;
	includes: string;
	in: string | Structures.Channel;
	before: string | Structures.Message;
	amount: number;
	bots: boolean;
	embeds: boolean;
	images: boolean;
};

export default class ClearCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['prune', 'purge'],
			disableDm: true,
			args: [
				{ name: 'from', type: String, required: false, aliases: ['by'] },
				{ name: 'includes', type: String, required: false, aliases: ['with'] },
				{ name: 'in', type: String, required: false, aliases: ['channel'] },
				{ name: 'before', type: String, required: false, aliases: ['antes de'] },
				{ name: 'bots', type: Boolean, required: false },
				{ name: 'images', type: Boolean, required: false, aliases: ['imagenes'] },
				{ name: 'embeds', type: Boolean, required: false },
			],
			label: 'amount',
			metadata: {
				description: 'Borra mensajes en un canal especifico',
				usage: '[cantidad] [-from] [-includes] [-in] [-before] [-bots] [-images] [-embeds]',
				example: [
					`${COMMAND_NAME} 69 -from fatand#3431`,
					`${COMMAND_NAME} 100 -includes n word`,
					`${COMMAND_NAME} 30 -before 946055250685603962`,
					`${COMMAND_NAME} 15 -in #general -bots`,
					`${COMMAND_NAME} 5 -images`,
					`${COMMAND_NAME} 15 -embeds`,
				],
				type: 'moderation',
			},
			type: Number,
			permissionsClient: [Permissions.MANAGE_CHANNELS, Permissions.MANAGE_MESSAGES],
			permissions: [Permissions.MANAGE_MESSAGES],
		});
	}
	onBeforeRun(context: Command.Context, args: param) {
		return !!args.amount;
	}

	onCancelRun(context: Command.Context, args: param) {
		if (!args.amount) return context.editOrReply('⚠ | Especifica la cantidad');
	}
	async run(context: Command.Context, args: param) {
		const messagesToDelete: Structures.Message[] = [];
		if (args.amount > 100)
			return context.editOrReply('⚠ | La cantidad maxima es de 100 mensajes');
		if (args.from) {
			const user = await getUserByText(context, args.from as string);
			if (!user || !(user instanceof Structures.Member))
				return context.editOrReply('⚠ | No pude encontrar el miembro especificado');
			args.from = user;
		}

		if (args.in) {
			const channel = await getGuildChannel(context, args.in as string);
			if (!channel || !(channel instanceof Structures.ChannelGuildText))
				return context.editOrReply(
					'⚠ | No pude encontrar el canal especificado o este no es de tipo texto'
				);
			args.in = channel;
		} else {
			args.in = context.channel;
		}
		if (args.before) {
			let channelToFetchMessage: Structures.Channel;
			if (args.in) {
				channelToFetchMessage = args.in as Structures.Channel;
			} else {
				channelToFetchMessage = context.channel;
			}
			const message = await channelToFetchMessage.fetchMessage(args.before as string);
			if (!message) return context.editOrReply('⚠ | No pude encontrar el mensaje especificado');
			args.before = message;
		} else {
			args.before = context.message;
		}

		const messages = (
			await (args.in as Channel)
				.fetchMessages({ before: (args.before as Structures.Message).id, limit: args.amount })
				.then((messages) => {
					if (args.from) {
						return messages.filter(
							(m) => m.author.id === (args.from as Structures.Member).id
						);
					} else return messages.toArray();
				})
		)
			.filter((message) => {
				if (args.includes)
					return message.content.toLowerCase().includes(args.includes.toLowerCase());
				else return true;
			})
			.filter((message) => {
				if (args.bots) return message.author.bot;
				else return true;
			})
			.filter((message) => {
				if (args.images) return message.hasAttachment;
				else return true;
			})
			.filter((message) => {
				if (args.embeds) return message.embeds.size > 0;
				else return true;
			});

		for (const message of messages) {
			if (this.canBulkDelete(Snowflake.timestamp(message.id))) messagesToDelete.push(message);
		}
		if (!messagesToDelete.length)
			return context.editOrReply('No se encontraron mensajes para borrar');
		const confirm = new Confirmation(context, {
			onAskingMessage: `**Se encontraron ${messagesToDelete.length}/${args.amount} mensajes\nQuieres proceder?**`,
			timeout: 10000,
			onConfirm: async () => {
				await this.bulkDelete(context, args.in as Structures.Channel, messagesToDelete)
					.then((result) => {
						const channel = args.in as Structures.Channel;
						context.editOrReply({
							content: `Se han borrado ${result} mensajes en ${
								channel.id === context.channelId ? 'este canal' : channel.mention
							}`,
							embeds: [],
						});
					})
					.catch(() => {
						context.editOrReply({
							content: `Hubo un error al borrar los mensajes`,
							embeds: [],
						});
					});
				if (!context.message.deleted) context.message.delete();
			},
			onCancel: () => {
				return context.editOrReply({
					embeds: [new Embed().setTitle(`Accion Cancelada`).setColor(EmbedColors.BLANK)],
				});
			},
			onTimeout: () => {
				return context.editOrReply({
					embeds: [
						new Embed().setTitle(`Accion Cancelada | Timeout`).setColor(EmbedColors.BLANK),
					],
				});
			},
		});
		return confirm.start();
	}
	async bulkDelete(
		context: Command.Context,
		channel: Structures.Channel,
		messages: Structures.Message[]
	) {
		let deleted: number = 0;
		const messagesToIds = messages.map((m) => m.id);
		deleted += messagesToIds.length;
		if (messagesToIds.length === 1)
			await channel.deleteMessage(messagesToIds[0], {
				reason: `Clear by ${context.member.tag}`,
			});
		else await channel.bulkDelete(messagesToIds);
		return deleted;
	}
	canBulkDelete(dateTimestamp: number): boolean {
		return Date.now() - dateTimestamp < 1_209_600_000;
	}
}
