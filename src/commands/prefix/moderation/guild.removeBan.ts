import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';
import { getUserByText } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import { Confirmation } from '../../../utils/confirm';

export const COMMAND_NAME = 'unban';
type param = {
	user: string;
	reason: string;
};

export default class RemoveGuildBan extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['ub', 'desbanear'],
			disableDm: true,
			args: [{ name: 'reason', type: String, required: false, aliases: ['razon'] }],
			label: 'user',
			metadata: {
				description: 'Banea a un usuario del servidor',
				usage: [`${COMMAND_NAME} [-reason]`],
				example: [
					`${COMMAND_NAME} 762143188655144991`,
					`${COMMAND_NAME} 762143188655144991 -reason hes cool`,
				],
				type: 'Moderation',
			},
			permissionsClient: [Permissions.EMBED_LINKS, Permissions.BAN_MEMBERS],
			permissions: [Permissions.BAN_MEMBERS],
		});
	}
	onBeforeRun(context: Command.Context, args: param) {
		return !!args.user.length;
	}

	onCancelRun(context: Command.Context, args: param) {
		return context.editOrReply('⚠ | Especifica el usuario');
	}
	async run(context: Command.Context, args: param) {
		let User =
			(context.message.mentions.first() as Structures.Member) ||
			(await getUserByText(context, args.user));
		if (!User) return context.editOrReply('⚠ | No pude encontrar el usuario');
		if (!(await this.alreadyBanned(context, User.id)))
			return context.editOrReply(`⚠ | El usuario no se encuentra baneado`);
		let reason = args.reason?.length ? args.reason : 'No se dio razón';
		if (reason.length > 513)
			return context.editOrReply('⚠ | La razon no puede exeder los 512 caracteres');

		let embedDm = new Embed();
		embedDm.setTitle(`${DiscordEmojis.SERVER} Unban Report:`);
		embedDm.setColor(EmbedColors.MAIN);
		embedDm.setThumbnail(context.guild.iconUrl);
		embedDm.setDescription(
			`Has sido desbaneado de \`${context.guild.name}\`\n**Moderador:** \`${context.member.tag}\`\n**Motivo:** \`${reason}\``
		);
		embedDm.setTimestamp();
		let memberDm = true;
		const confirm = new Confirmation(context, {
			onAskingMessage: `**Quieres desbanear a ${User.tag}?**`,
			timeout: 10000,
			onConfirm: async () => {
				await context.client.rest
					.removeGuildBan(context.guildId, User.id, { reason: reason })
					.then(async () => {
						await User.createMessage({ embeds: [embedDm] })
							.catch(() => (memberDm = false))
							.then(() => {
								let embed = new Embed()
									.setDescription(
										`${DiscordEmojis.BLOCKUSER} \`${User.tag}\` ha sido desbaneado`
									)
									.setFooter('El usuario fue notificado por DMs')
									.setColor(EmbedColors.BLANK);
								context.editOrReply({ embeds: [embed] });
								this.sendLogEmbed(context, memberDm, User, reason);
							});
					});
				return;
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
	async alreadyBanned(context: Command.Context, userId: string) {
		let isBanned: boolean = false;
		await context.client.rest
			.fetchGuildBans(context.guildId)
			.then((log) => log.find((entry) => entry.user.id === userId))
			.then(async (entry) => {
				if (entry) isBanned = true;
			});
		return isBanned;
	}
	sendLogEmbed(
		context: Command.Context,
		memberDm: boolean,
		target: Structures.Member | Structures.User,
		reason: string
	) {
		let serverData = CacheCollection.get(context.guildId);
		const channelId = serverData.Channels.ModLog;
		if (channelId.length && context.guild.channels.has(channelId)) {
			const embed = new Embed();
			embed.setTitle(`${DiscordEmojis.BLOCKUSER} Unban Result:`);
			embed.setColor(EmbedColors.MAIN);
			embed.setThumbnail(target.avatarUrl);
			embed.setDescription(
				`${target.mention} | \`${target.id}\` ha sido desbaneado\n**Moderador:** \`${
					context.member.tag
				}\`\n**Motivo:** \`${reason}\`\n\n**Mas detalles:**\n${
					DiscordEmojis.CLOCK
				} Fecha: <t:${Math.floor(Date.now() / 1000)}:R>\n${
					DiscordEmojis.BLOCKUSER
				} Usuario avisado?: ${memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO}`
			);
			return context.guild.channels.get(channelId).createMessage({ embeds: [embed] });
		}
	}
}
