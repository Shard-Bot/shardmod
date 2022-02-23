import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';
import { getUserByText, timeoutMember, canTimeout } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import ms from 'ms';
import config from '../../../../config.json';
import { Confirmation } from '../../../utils/confirm';

export const COMMAND_NAME = 'timeout';
type param = {
	force: boolean;
	user: string;
	time: string;
	reason: string;
};

export default class MemberTimeoutCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['mute', 'aislar', 'm'],
			disableDm: true,
			args: [
				{ name: 'time', type: String, required: true, aliases: ['tiempo', 'duracion', 't'] },
				{ name: 'reason', type: String, required: false, aliases: ['razon', 'r'] },
				{ name: 'force', type: Boolean, required: false },
			],
			label: 'user',
			metadata: {
				description: 'Aisla a un miembro del servidor durante un tiempo',
				usage: [`${COMMAND_NAME} <-time> [-force] [-reason]`],
				example: [
					`${COMMAND_NAME} fatand#3431 -time 1m`,
					`${COMMAND_NAME} fatand#3431 -time 10d -reason Insultos`,
					`${COMMAND_NAME} @someAdminMember -time 1h -force`,
				],
				type: 'Moderation',
			},
			permissionsClient: [Permissions.EMBED_LINKS, Permissions.MANAGE_ROLES],
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
				`⚠ | No tengo los permisos necesarios para aislar a ${User.tag}`
			);
		if (!this.canTimeoutMembers(context, member))
			return context.editOrReply(
				`⚠ | No tienes los permisos necesarios para aislar a ${User.tag}`
			);
		if (member.communicationDisabledUntilUnix)
			return context.editOrReply(`⚠ | El usuario ${User.tag} ya se encuentra aislado`);
		let reason = args.reason?.length ? args.reason : 'No se dio razón';
		if (reason.length > 513)
			return context.editOrReply('⚠ | La razon no puede exeder los 512 caracteres');
		if (User.id === context.userId)
			return context.editOrReply(`⚠ | No te puedes aislar a ti mismo`);
		if (User.id === context.guild.ownerId)
			return context.editOrReply(`⚠ | No puedes aislar al propietario del servidor`);
		if (member.canAdministrator && !args.force)
			return context.editOrReply(`⚠ | No puedes aislar administradores!`);

		let embedDm = new Embed();
		embedDm.setTitle(`${DiscordEmojis.TIMEOUT} ${args.force ? 'Force' : ''} Timeout Report:`);
		embedDm.setColor(EmbedColors.MAIN);
		embedDm.setThumbnail(context.guild.iconUrl);
		embedDm.setDescription(
			`Has sido aislado temporalmente de \`${context.guild.name}\`\n**Moderador:** \`${context.member.tag}\`\n**Duración:** \`${args.time}\`\n**Motivo:** \`${reason}\``
		);
		embedDm.setTimestamp();
		let time = ms(args.time);
		if (isNaN(time))
			return context.editOrReply(`⚠ | Establece una duracion valida (\`Ejemplo: 5m, 1h\`)`);
		if (time < 60000) return context.editOrReply(`⚠ | Establece una duracion mayor a un minuto`);
		if (time > 2419200000)
			return context.editOrReply(`⚠ | Establece una duracion menor a 28 dias`);
		let memberDm = true;
		const confirm = new Confirmation(context, {
			onAskingMessage: `**Quieres aislar a ${member} durante ${args.time}?**`,
			timeout: 10000,
			onConfirm: async () => {
				if (args.force) {
					for (let role of member.roles.toArray()) {
						if (role.botId) {
							if (role.can(1 << 3))
								await role
									.edit({
										permissions: Number(role.permissions.toString()) - 0x8,
										reason: `FORCED TIMEOUT by ${context.member.tag}`,
									})
									.catch(() => {
										return context.editOrReply(
											'⚠ | Ocurrio un error al aislar el usuario.'
										);
									})
									.then(() => {
										setTimeout(() => {
											role
												.edit({
													permissions: Number(role.permissions.toString()) + 0x8,
													reason: `FORCED TIMEOUT Done`,
												})
												.catch(() => null);
										}, time);
									});
						} else {
							if (role.can(1 << 3))
								await member
									.removeRole(role.id, {
										reason: `FORCED TIMEOUT by ${context.member.tag}`,
									})
									.catch(() => {
										return context.editOrReply(
											'⚠ | Ocurrio un error al aislar el usuario.'
										);
									})
									.then(() => {
										setTimeout(() => {
											member
												.addRole(role.id, {
													reason: `FORCED TIMEOUT Done`,
												})
												.catch(() => null);
										}, time);
									});
						}
					}
					timeoutMember({ member: member, reason: reason, time: time });
					User.createMessage({ embeds: [embedDm] })
						.catch(() => (memberDm = false))
						.then(() => {
							let embed = new Embed()
								.setDescription(
									`${DiscordEmojis.TIMEOUT} \`${User.tag}\` ha sido aislado temporalmente por ${args.time}`
								)
								.setFooter('El usuario fue notificado por DMs')
								.setColor(EmbedColors.BLANK);
							context.editOrReply({ embeds: [embed] });
							this.sendLogEmbed(context, memberDm, args.force, member, args.time, reason);
						});
				} else {
					timeoutMember({ member: member, reason: reason, time: time });
					await User.createMessage({ embeds: [embedDm] })
						.catch(() => (memberDm = false))
						.then(() => {
							let embed = new Embed()
								.setDescription(
									`${DiscordEmojis.TIMEOUT} \`${User.tag}\` ha sido aislado temporalmente por ${args.time}`
								)
								.setFooter('El usuario fue notificado por DMs')
								.setColor(EmbedColors.BLANK);
							context.editOrReply({ embeds: [embed] });
							this.sendLogEmbed(context, memberDm, args.force, member, args.time, reason);
						});
				}
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
		if (CacheCollection.get(context.guildId).Users.Trusted.includes(context.member.id))
			return false;
		if (context.member.isClientOwner) return true;
		if (context.member.can(1 << 40) && context.member.canEdit(target)) return true;
		return false;
	}
	sendLogEmbed(
		context: Command.Context,
		memberDm: boolean,
		force: boolean,
		target: Structures.Member,
		time: string,
		reason: string
	) {
		let serverData = CacheCollection.get(context.guildId);
		const channelId = serverData.Channels.ModLog;
		if (channelId.length && context.guild.channels.has(channelId)) {
			const embed = new Embed();
			embed.setTitle(`${DiscordEmojis.TIMEOUT} ${force ? 'Force' : ''} Timeout Result:`);
			embed.setColor(EmbedColors.MAIN);
			embed.setThumbnail(target.avatarUrl);
			embed.setDescription(
				`${target.mention} | \`${target.id}\` ha sido aislado temporalmente\n**Moderador:** \`${
					context.member.tag
				}\`\n**Duración:** \`${time}\`\n**Motivo:** \`${reason}\`\n\n**Mas detalles:**\n${
					DiscordEmojis.CLOCK
				} Fecha: <t:${Math.floor(Date.now() / 1000)}:R>\n${
					DiscordEmojis.BLOCKUSER
				} Usuario avisado?: ${memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO}`
			);
			return context.guild.channels.get(channelId).createMessage({ embeds: [embed] });
		}
	}
}
