import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors } from '../../../utils/constants';
import { getGuildChannel } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import { deletedMessages, editedMessages } from '../../../cache/snipesCache';

export const COMMAND_NAME = 'snipe';
type param = {
	amount: number;
	in: string;
	edit: boolean;
};

export default class MemberRemoveTimeoutCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['recent messages', 'sp'],
			disableDm: true,
			args: [
				{ name: 'in', type: String, required: false, aliases: ['channel'] },
				{ name: 'edit', type: Boolean, required: false, aliases: ['editsnipe'] },
			],
			label: 'amount',
			metadata: {
				description: 'Muestra un mensaje borrado o editado recientemente en un canal',
				usage: [`${COMMAND_NAME} [-in] [-edit]`],
				example: [`${COMMAND_NAME} 1 -in #general*`],
				type: 'Moderation',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
			permissions: [Permissions.MANAGE_MESSAGES],
		});
	}
	async run(context: Command.Context, args: param) {
		let channel: Structures.ChannelGuildText;
		if (args.in) {
			const requestedChannel = await getGuildChannel(context, args.in);
			if (!requestedChannel || !(requestedChannel instanceof Structures.ChannelGuildText))
				return context.editOrReply(
					'⚠ | No pude encontrar el canal especificado o este no es de tipo texto'
				);
			channel = requestedChannel;
		} else {
			channel = context.channel as Structures.ChannelGuildText;
		}
		let snipes = deletedMessages.get(channel.id);
		if (args.edit) {
			snipes = editedMessages.get(channel.id);
		}
		const amount = args.amount ? args.amount : 1;
		if (!snipes) return context.editOrReply('ℹ️ | Nada que mostrar');
		const snipe = +amount - 1 || 0;
		const data = snipes[snipe];
		if (!data) return context.editOrReply(`ℹ️ | Solo hay ${snipes.length} mensaje(s)`);

		const embed = new Embed();
		embed.setAuthor(data.message.author.tag, data.message.author.avatarUrl);
		embed.setDescription(
			`${
				data.message.content ||
				`Sin descripción ${data.message.author.bot ? '(Probablemente un mensaje embed)' : ''}`
			}\n${args.edit ? `[Ver mensaje](${data.message.jumpLink})` : ''}`
		);
		embed.setImage(data.message.attachments.first()?.proxyUrl ?? null);
		embed.setFooter(`${snipe + 1}/${snipes.length}`);
		embed.setTimestamp(data.message.createdAt);
		embed.setColor(EmbedColors.MAIN);
		return context.editOrReply({ embeds: [embed] });
	}
}
