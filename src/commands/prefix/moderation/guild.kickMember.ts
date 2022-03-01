import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';
import { getUserByText } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import config from '../../../../config.json';
import { Confirmation } from '../../../utils/confirm';

export const COMMAND_NAME = 'kick';
type param = {
	user: string;
	reason: string;
};

export default class RemoveGuildMember extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['k', 'expulsar'],
			disableDm: true,
			args: [{ name: 'reason', type: String, required: false, aliases: ['razon'] }],
			label: 'user',
			metadata: {
				description: 'Expulsa a un usuario del servidor',
				usage: [`${COMMAND_NAME} [-reason]`],
				example: [`${COMMAND_NAME} fatand#3431 -reason Insultos`],
				type: 'Moderation',
			},
			permissionsClient: [Permissions.EMBED_LINKS, Permissions.KICK_MEMBERS],
			permissions: [Permissions.KICK_MEMBERS],
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
		const isMember = User instanceof Structures.Member;
		let member = User as Structures.Member;
		if (!isMember) return context.editOrReply('⚠ | No pude encontrar el miembro');
		if (!context.guild.me.canEdit(member))
			return context.editOrReply(
				`⚠ | No tengo los permisos necesarios para banear a ${User.tag}`
			);
		let reason = args.reason?.length ? args.reason : 'No se dio razón';
		if (reason.length > 513)
			return context.editOrReply('⚠ | La razon no puede exeder los 512 caracteres');

		let embedDm = new Embed();
		embedDm.setTitle(`${DiscordEmojis.SERVER} Kick Report:`);
		embedDm.setColor(EmbedColors.MAIN);
		embedDm.setThumbnail(context.guild.iconUrl);
		embedDm.setDescription(
			`Has sido expulsado de \`${context.guild.name}\`\n**Moderador:** \`${context.member.tag}\`\n**Motivo:** \`${reason}\``
		);
		embedDm.setTimestamp();
		let memberDm = true;
		const confirm = new Confirmation(context, {
			onAskingMessage: `**Quieres expulsar a ${member.tag}?**`,
			timeout: 10000,
			onConfirm: async () => {
				await member.remove({ reason }).then(async () => {
					await User.createMessage({ embeds: [embedDm] })
						.catch(() => (memberDm = false))
						.then(() => {
							let embed = new Embed()
								.setDescription(
									`${DiscordEmojis.BLOCKUSER} \`${User.tag}\` ha sido expulsado`
								)
								.setFooter('El usuario fue notificado por DMs')
								.setColor(EmbedColors.BLANK);
							context.editOrReply({ embeds: [embed] });
							this.sendLogEmbed(context, memberDm, member, reason);
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
	canKickMembers(member: Structures.Member, target: Structures.Member) {
		if (target.isClientOwner || config.devsIds.includes(target.id)) return false;
		if (CacheCollection.get(member.guildId).Users.Trusted.includes(target.id)) return false;
		if (CacheCollection.get(member.guildId).Users.Trusted.includes(member.id)) return true;
		if (member.isClientOwner) return true;
		if (member.canEdit(target)) return true;
		return false;
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
			embed.setTitle(`${DiscordEmojis.BLOCKUSER} Kick Result:`);
			embed.setColor(EmbedColors.MAIN);
			embed.setThumbnail(target.avatarUrl);
			embed.setDescription(
				`${target.mention} | \`${target.id}\` ha sido expulsado\n**Moderador:** \`${
					context.member.tag
				}\`\n**Motivo:** \`${reason}\`\n\n**Mas detalles:**\n${
					DiscordEmojis.CLOCK
				} Fecha: <t:${Math.floor(Date.now() / 1000)}:R>\n${
					DiscordEmojis.BLOCKUSER
				} Usuario avisado: ${memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO}`
			);
			return context.guild.channels.get(channelId).createMessage({ embeds: [embed] });
		}
	}
}
