import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';
import { getUserByText, timeoutMember, canTimeout } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import config from '../../../../config.json';
import { Confirmation } from '../../../utils/confirm';

export const COMMAND_NAME = 'remove timeout';
type param = {
	user: string;
	reason: string;
};

export default class MemberRemoveTimeoutCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['unmute', 'desaislar', 'rt', 'um', 'untimeout', 'clear timeout'],
			disableDm: true,
			args: [{ name: 'reason', type: String, required: false, aliases: ['razon'] }],
			label: 'user',
			metadata: {
				description: 'Remueve a un miembro el aislamiento en el servidor',
				usage: [`${COMMAND_NAME} [-reason]`],
				example: [`${COMMAND_NAME} fatand#3431 -reason alguna razón random*`],
				type: 'Moderation',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	onBeforeRun(context: Command.Context, args: param) {
		return !!args.user.length;
	}

	onCancelRun(context: Command.Context, args: param) {
		return context.editOrReply('⚠ | Especifica el miembro');
	}
	async run(context: Command.Context, args: param) {
		let User =
			(context.message.mentions.first() as Structures.Member) ||
			(await getUserByText(context, args.user));
		if (!User) return context.editOrReply('⚠ | No pude encontrar el miembro');
		const isMember = User instanceof Structures.Member;
		if (!isMember) return context.editOrReply('⚠ | El usuario debe ser miembro del servidor');
		let member = User as Structures.Member;
		if (!canTimeout(context.guild, member))
			return context.editOrReply(
				`⚠ | No tengo los permisos necesarios para remover el aislamiento de ${User.tag}`
			);
		if (!this.canTimeoutMembers(context, member))
			return context.editOrReply(
				`⚠ | No tienes los permisos necesarios para remover el aislamiento de ${User.tag}`
			);
		if (!member.communicationDisabledUntilUnix)
			return context.editOrReply(`⚠ | El usuario ${User.tag} no se encuentra aislado`);
		let reason = args.reason?.length ? args.reason : 'No se dio razón';
		if (reason.length > 513)
			return context.editOrReply('⚠ | La razon no puede exeder los 512 caracteres');
		let embedDm = new Embed();
		embedDm.setTitle(`${DiscordEmojis.TIMEOUT} Clear Timeout Report:`);
		embedDm.setColor(EmbedColors.MAIN);
		embedDm.setThumbnail(context.guild.iconUrl);
		embedDm.setDescription(
			`\`${context.guild.name}\` Ha removido tu aislamiento temporal\n**Moderador:** \`${context.member.tag}\`\n**Motivo:** \`${reason}\``
		);
		embedDm.setTimestamp();
		let memberDm = true;
		const confirm = new Confirmation(context, {
			onAskingMessage: `**Quieres remover el asilamiento de ${member}?**`,
			timeout: 10000,
			onConfirm: async () => {
				timeoutMember({ member: member, reason: reason });
				await User.createMessage({ embeds: [embedDm] })
					.catch(() => (memberDm = false))
					.then(() => {
						let embed = new Embed()
							.setDescription(
								`${DiscordEmojis.TIMEOUT} Se ha removido el aislamiento de \`${User.tag}\``
							)
							.setFooter('El usuario fue notificado por DMs')
							.setColor(EmbedColors.BLANK);
						context.editOrReply({ embeds: [embed] });
						this.sendLogEmbed(context, memberDm, member, reason);
					});
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
	canTimeoutMembers(context: Command.Context, target: Structures.Member) {
		if (target.isClientOwner || config.devsIds.includes(target.id)) return false;
		if (context.member.isClientOwner) return true;
		if (context.member.can(1 << 40) && context.member.canEdit(target)) return true;
		return false;
	}
	sendLogEmbed(
		context: Command.Context,
		memberDm: boolean,
		target: Structures.Member,
		reason: string
	) {
		let serverData = CacheCollection.get(context.guildId);
		const channelId = serverData.Channels.ModLog;
		if (channelId.length && context.guild.channels.has(channelId)) {
			const embed = new Embed();
			embed.setTitle(`${DiscordEmojis.TIMEOUT} Clear Timeout Result:`);
			embed.setColor(EmbedColors.MAIN);
			embed.setThumbnail(target.avatarUrl);
			embed.setDescription(
				`${target.mention} | \`${target.id}\` Aislamiento removido\n**Moderador:** \`${
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
