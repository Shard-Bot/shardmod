import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';
import { getUserByText, timeoutMember, canTimeout, createId } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import ms from 'ms';
import config from '../../../../config.json';
import { Confirmation } from '../../../utils/confirm';
import { defaultData, Model } from '../../../schemas/guildwarns';

export const COMMAND_NAME = 'warn';
type param = {
	user: string;
	reason: string;
};

export default class MemberWarnCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['wa', 'avisar'],
			disableDm: true,
			args: [{ name: 'reason', type: String, required: false, aliases: ['razon', 'r'] }],
			label: 'user',
			metadata: {
				description: 'Añade un aviso a un miembro del servidor',
				usage: '[Miembro] [-reason]',
				example: [
					`${COMMAND_NAME} fatand#3431`,
					`${COMMAND_NAME} fatand#3431 -reason Insultos`,
				],
				type: 'moderation',
			},
			permissionsClient: [Permissions.EMBED_LINKS, Permissions.MANAGE_ROLES],
		});
	}
	onBeforeRun(context: Command.Context, args: param) {
		const hasPermissions =
			context.member.can(Permissions.MANAGE_GUILD) ||
			context.member.can(Permissions.KICK_MEMBERS) ||
			context.member.can(Permissions.BAN_MEMBERS) ||
			context.member.isClientOwner;
		if (!hasPermissions) return false;
		return !!args.user.length;
	}
	onCancelRun(context: Command.Context, args: any) {
		const hasPermissions =
			context.member.can(Permissions.MANAGE_GUILD) ||
			context.member.can(Permissions.KICK_MEMBERS) ||
			context.member.can(Permissions.BAN_MEMBERS) ||
			context.member.isClientOwner;
		if (!hasPermissions)
			return context.editOrReply('⚠ | No tienes permiso para usar este comando');
		return context.editOrReply('⚠ | Especifica el usuario');
	}

	async run(context: Command.Context, args: param) {
		let data = await Model.findOne({ ServerID: context.guildId });
		if (!data) data = await Model.create(defaultData(context.guildId));
		let User =
			(context.message.mentions.first() as Structures.Member) ||
			(await getUserByText(context, args.user));
		if (!User) return context.editOrReply('⚠ | No pude encontrar el miembro');
		const isMember = User instanceof Structures.Member;
		if (!isMember) return context.editOrReply('⚠ | El usuario debe ser miembro del servidor');
		let member = User as Structures.Member;
		if (!this.canWarnMembers(context, member))
			return context.editOrReply(
				`⚠ | No tienes los permisos necesarios para avisar a ${User.tag}`
			);
		if (member.id === context.member.id)
			return context.editOrReply(`⚠ | No puedes avisarte a ti mismo`);
		if (member.bot) return context.editOrReply(`⚠ | No puedes avisar bots`);
		if (data.Warns.filter((warn) => warn.targetId === member.id).length > 20)
			return context.editOrReply('⚠ | El usuario alcanzo el maximo de avisos en el servidor');
		let reason = args.reason?.length ? args.reason : 'No se dio razón';
		if (reason.length > 513)
			return context.editOrReply('⚠ | La razon no puede exeder los 512 caracteres');
		const confirm = new Confirmation(context, {
			onAskingMessage: `**Quieres avisar a ${member}?**`,
			timeout: 10000,
			onConfirm: async () => {
				let warnId = createId(5);
				const warnCount = data.Warns.filter((warn) => warn.targetId === member.id).length + 1;
				let embed = new Embed()
					.setDescription(
						`${DiscordEmojis.RULES} \`${User.tag}\` **ha sido avisado (Total: ${warnCount})**`
					)
					.setFooter(`El usuario fue avisado por DMs • Warn ID: ${warnId}`)
					.setColor(EmbedColors.BLANK);

				if (warnCount >= data.Maxwarns) {
					const action = await this.onMaxWarns(context, data.Action, {
						target: member,
						reason,
						warnId,
					});
					if (action !== 'Ignore') {
						this.onMaxWarnsReport(context, action, { target: member, warnId });
					}
					this.sendReport(context, { target: member, reason, warnId });
					return context.editOrReply({ embeds: [embed] });
				}
				this.warnMember(context, member.id, reason, warnId);
				this.sendReport(context, { target: member, reason, warnId });
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
	async canWarnMembers(context: Command.Context, target: Structures.Member) {
		if (target.isClientOwner || config.devsIds.includes(target.id)) return false;
		if(target.isOwner) return false;
		if ((await CacheCollection.getOrFetch(context.guildId)).Users.Trusted.includes(target.id)) return false;
		if ((await CacheCollection.getOrFetch(context.guildId)).Users.Trusted.includes(context.member.id))
			return true;
		if (context.member.isClientOwner) return true;
		if (context.member.can(Permissions.MANAGE_GUILD) && context.member.canEdit(target))
			return true;
		return false;
	}
	async warnMember(context: Command.Context, targetId: string, reason: string, warnId: string) {
		await Model.findOneAndUpdate(
			{ ServerID: context.guildId },
			{
				$push: {
					['Warns']: {
						id: warnId,
						reason: reason,
						date: Math.round(Date.now() / 1000),
						moderatorId: context.member.id,
						targetId: targetId,
					},
				},
			}
		);
	}
	async onMaxWarns(
		context: Command.Context,
		action: string,
		warnArgs: { target: Structures.Member; reason: string; warnId: string }
	) {
		await this.warnMember(context, warnArgs.target.id, warnArgs.reason, warnArgs.warnId);
		switch (action.toLowerCase()) {
			case 'timeout':
				if (!canTimeout(context.guild, warnArgs.target)) return 'Ignore';
				timeoutMember({
					member: warnArgs.target,
					reason: '[Warns] Usuario llego al limite de warns',
					time: ms('28d'),
				}).catch(() => null);
				return 'Timeout';
			case 'ban':
				if (!(context.guild.me.canBanMembers && context.guild.me.canEdit(warnArgs.target)))
					return 'Ignore';
				warnArgs.target
					.ban({ reason: '[Warns] Usuario llego al limite de warns' })
					.catch(() => null);
				return 'Ban';
			case 'kick':
				if (!(context.guild.me.canKickMembers && context.guild.me.canEdit(warnArgs.target)))
					return 'Ignore';
				warnArgs.target
					.remove({ reason: '[Warns] Usuario llego al limite de warns' })
					.catch(() => null);
				return 'Kick';
			default:
				return 'Ignore';
		}
	}
	onMaxWarnsReport(
		context: Command.Context,
		action: string,
		warnArgs: { target: Structures.Member; warnId: string }
	) {
		let reasons = {
			md: {
				Ban: 'Has baneado de',
				Kick: 'Has sido expulsado de',
				Timeout: 'Has sido aislado temporalmente por 28 dias en',
			},
			Ban: 'ha sido baneado',
			Kick: 'ha sido expulsado',
			Timeout: 'ha sido aislado temporalmente por 28 dias',
		};

		let embedDM = new Embed()
			.setTitle(`[Warn] ${action} Report:`)
			.setThumbnail(warnArgs.target.guild.iconUrl)
			.setDescription(
				`${reasons.md[action]} \`${context.guild.name}\`\n**Moderador:** \`${
					context.member.tag
				}\`\n**Motivo:** \`Excediste el limite de warns\`\n**Fecha:** <t:${Math.round(
					Date.now() / 1000
				)}:R>`
			)
			.setTimestamp()
			.setColor(EmbedColors.MAIN)
			.setFooter(`Warn ID: ${warnArgs.warnId}`);

		let memberDm = true;

		warnArgs.target
			.createMessage({ embeds: [embedDM] })
			.catch(() => (memberDm = false))
			.then(async () => {
				let embedLog = new Embed()
					.setTitle(`[Warn] ${action} Report:`)
					.setThumbnail(warnArgs.target.avatarUrl)
					.setColor(EmbedColors.MAIN)
					.setDescription(
						`${warnArgs.target.mention} | \`${warnArgs.target.id}\` ${
							reasons[action]
						}\n**Motivo:** \`Usuario excedio el limite de warns\`\n\n**Mas detalles:**\n${
							DiscordEmojis.CLOCK
						} Fecha: <t:${Math.round(Date.now() / 1000)}:R>\n${
							DiscordEmojis.BLOCKUSER
						} Usuario avisado: ${memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO}`
					);

				let serverData = await CacheCollection.getOrFetch(context.guildId);
				const channelId = serverData.Channels.BotLog;

				if (channelId.length && context.guild.channels.has(channelId)) {
					return context.guild.channels.get(channelId).createMessage({ embeds: [embedLog] });
				}
			});
	}
	sendReport(
		context: Command.Context,
		warnArgs: { target: Structures.Member; reason: string; warnId: string }
	) {
		let embedDM = new Embed()
			.setTitle(`Warn Report:`)
			.setThumbnail(warnArgs.target.guild.iconUrl)
			.setDescription(
				`Has sido avisado en \`${context.guild.name}\`\n**Moderador:** \`${
					context.member.tag
				}\`\n**Motivo:** \`${warnArgs.reason}\`\n**Fecha:** <t:${Math.round(
					Date.now() / 1000
				)}:R>`
			)
			.setTimestamp()
			.setFooter(`Warn ID: ${warnArgs.warnId}`)
			.setColor(EmbedColors.MAIN);

		let memberDm = true;

		warnArgs.target
			.createMessage({ embeds: [embedDM] })
			.catch(() => (memberDm = false))
			.then(async () => {
				let embedLog = new Embed()
					.setTitle(`Warn Result:`)
					.setThumbnail(warnArgs.target.avatarUrl)
					.setDescription(
						`${warnArgs.target.mention} | \`${
							warnArgs.target.id
						}\` Ha sido avisado\n**Moderador:** \`${context.member.tag}\`\n**Motivo:** \`${
							warnArgs.reason
						}\`\n\n**Mas detalles:**\n${DiscordEmojis.CLOCK} Fecha: <t:${Math.round(
							Date.now() / 1000
						)}:R>\n${DiscordEmojis.BLOCKUSER} Usuario avisado: ${
							memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO
						}\n${DiscordEmojis.RULES} Warn Id: \`${warnArgs.warnId}\``
					)
					.setColor(EmbedColors.MAIN);

				let serverData = await CacheCollection.getOrFetch(context.guildId);
				const channelId = serverData.Channels.ModLog;

				if (channelId.length && context.guild.channels.has(channelId)) {
					return context.guild.channels.get(channelId).createMessage({ embeds: [embedLog] });
				}
			});
	}
}
