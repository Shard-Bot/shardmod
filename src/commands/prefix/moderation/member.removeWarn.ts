import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import { getUserByText } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import { defaultData, Model } from '../../../schemas/guildwarns';
import { GuildWarns } from '../../../utils/types';
import { paginate } from '../../../utils/paginador';
import { Confirmation } from '../../../utils/confirm';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'remove warn';
type param = {
	warnid: string;
	reason: string;
};

export default class GuildWarnsCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['unwarn', 'delwarn', 'unwa'],
			disableDm: true,
			label: 'warnid',
			args: [{ name: 'reason', type: String, required: false, aliases: ['r'] }],
			metadata: {
				description: 'Remueve un aviso a un usuario',
				usage: [`${COMMAND_NAME} WarnID`],
				example: [`${COMMAND_NAME} fatand#3431`, `${COMMAND_NAME} NrCBQ`],
				type: 'Moderation',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	onBeforeRun(context: Command.Context, args: param) {
		const hasPermissions =
			context.member.can(Permissions.MANAGE_GUILD) ||
			context.member.can(Permissions.KICK_MEMBERS) ||
			context.member.can(Permissions.BAN_MEMBERS) ||
			context.member.isClientOwner;
		if (!hasPermissions) return false;
		return !!args.warnid.length;
	}
	onCancelRun(context: Command.Context, args: any) {
		const hasPermissions =
			context.member.can(Permissions.MANAGE_GUILD) ||
			context.member.can(Permissions.KICK_MEMBERS) ||
			context.member.can(Permissions.BAN_MEMBERS) ||
			context.member.isClientOwner;
		if (!hasPermissions)
			return context.editOrReply('⚠ | No tienes permiso para usar este comando');
		return context.editOrReply('⚠ | Especifica la id del aviso');
	}
	async run(context: Command.Context, args: param) {
		let data = await Model.findOne({ ServerID: context.guildId });
		if (!data) data = await Model.create(defaultData(context.guildId));
		if (!data.Warns.length)
			return context.editOrReply('⚠ | El servidor no tiene avisos registrados');
		let warn: GuildWarns['Warns'][0] = data.Warns.find(
			({ id }) => id.toLowerCase() === args.warnid.toLowerCase()
		);
		if (!warn) return context.editOrReply('⚠ | No existe un aviso con esa id');
		const target = await getUserByText(context, warn.targetId);
		const moderator = await getUserByText(context, warn.moderatorId);
		let reason = args.reason?.length ? args.reason : 'No se dio razón';
		if (reason.length > 513)
			return context.editOrReply('⚠ | La razon no puede exeder los 512 caracteres');
		const confirm = new Confirmation(context, {
			onAskingMessage: `**Quieres remover el aviso de ${target.tag}?**`,
			timeout: 10000,
			onConfirm: async () => {
				let embed = new Embed()
					.setDescription(
						`${DiscordEmojis.RULES} \`${target.tag}\` **Aviso removido (Total: ${
							data.Warns.filter(({ targetId }) => targetId === target.id).length
						})**`
					)
					.setFooter(`El usuario fue avisado por DMs`)
					.setColor(EmbedColors.BLANK);
				await Model.findOneAndUpdate(
					{ ServerID: context.guildId },
					{ $pull: { ['Warns']: warn } }
				);
				this.sendReport(context, { target: target, reason });
				return context.editOrReply({ embeds: [embed] });
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
	sendReport(
		context: Command.Context,
		warnArgs: { target: Structures.Member | Structures.User; reason: string }
	) {
		let embedDM = new Embed()
			.setTitle(`Unwarn Report:`)
			.setThumbnail(
				warnArgs.target instanceof Structures.Member ? warnArgs.target.guild.iconUrl : null
			)
			.setDescription(
				`Te han removido un aviso en \`${context.guild.name}\`\n**Moderador:** \`${
					context.member.tag
				}\`\n**Motivo:** \`${warnArgs.reason}\`\n**Fecha:** <t:${Math.round(
					Date.now() / 1000
				)}:R>`
			)
			.setTimestamp()
			.setColor(EmbedColors.MAIN);

		let memberDm = true;

		warnArgs.target
			.createMessage({ embeds: [embedDM] })
			.catch(() => (memberDm = false))
			.then(() => {
				let embedLog = new Embed()
					.setTitle('Unwarn Result:')
					.setThumbnail(warnArgs.target.avatarUrl)
					.setDescription(
						`${warnArgs.target.mention} | \`${
							warnArgs.target.id
						}\` Aviso removido\n**Moderador:** \`${context.member.tag}\`\n**Motivo:** \`${
							warnArgs.reason
						}\`\n\n**Mas detalles:**\n${DiscordEmojis.CLOCK} Fecha: <t:${Math.round(
							Date.now() / 1000
						)}:R>\n${DiscordEmojis.BLOCKUSER} Usuario avisado: ${
							memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO
						}`
					)
					.setColor(EmbedColors.MAIN);

				let serverData = CacheCollection.get(context.guildId);
				const channelId = serverData.Channels.ModLog;

				if (channelId.length && context.guild.channels.has(channelId)) {
					return context.guild.channels.get(channelId).createMessage({ embeds: [embedLog] });
				}
			});
	}
}
