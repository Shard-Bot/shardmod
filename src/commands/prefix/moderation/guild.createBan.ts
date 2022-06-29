import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';
import { getUserByText } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import ms from 'ms';
import config from '../../../../config.json';
import { Confirmation } from '../../../utils/confirm';

export const COMMAND_NAME = 'ban';
type param = {
	user: string;
	time: string;
	reason: string;
	clear: boolean;
};

export default class CreateGuildBan extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['b', 'banear'],
			disableDm: true,
			args: [
				{
					name: 'time',
					type: String,
					required: false,
					aliases: ['tiempo', 'duracion'],
				},
				{ name: 'reason', type: String, required: false, aliases: ['razon'] },
				{
					name: 'clear',
					type: Boolean,
					required: false,
					aliases: ['deletemessages'],
				},
			],
			label: 'user',
			metadata: {
				description: 'Banea a un usuario o miembro del servidor',
				usage: '[Usuario|Miembro] [-time] [-reason] [-clear]',
				example: [
					`${COMMAND_NAME} fatand#3431 -clear`,
					`${COMMAND_NAME} fatand#3431 -time 10d -reason Insultos`,
				],
				type: 'moderation',
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
		let member = User as Structures.Member;
		if (!(await this.canBanMembers(context.member, member)) && User instanceof Structures.Member)
			return context.editOrReply(
				`⚠ | No tienes los permisos necesarios para banear a ${User.tag}`
			);
		if (await this.alreadyBanned(context, User.id))
			return context.editOrReply(`⚠ | El usuario ya se encuentra baneado`);
		if (User.isMe) return context.editOrReply(`⚠ | No puedes banearme`);
		if(User.id === context.userId) return context.editOrReply(`⚠ | No puedes banearte`);
		if(!(await this.canBanMembers(context.member, member))) return;
		let bantime: null | number = null;
		if (args.time) {
			const time = ms(args.time);
			if (isNaN(time))
				return context.editOrReply(
					`⚠ | Establece una duracion valida (\`Ejemplo: 5m, 1h\`)`
				);
			if (time > 2629800000)
				return context.editOrReply('⚠ | La duracion no puede exceder 30 dias');
			if (time < 300000)
				return context.editOrReply(
					'⚠ | La duracion no puede ser menor a 5 minutos'
				);
			bantime = time;
		}
		if (User instanceof Structures.Member) {
			if (!context.guild.me.canEdit(member))
				return context.editOrReply(
					`⚠ | No tengo los permisos necesarios para banear a ${User.tag}`
				);
		}
		let reason = args.reason?.length ? args.reason : 'No se dio razón';
		if (reason.length > 513)
			return context.editOrReply('⚠ | La razon no puede exeder los 512 caracteres');

		let embedDm = new Embed();
		embedDm.setTitle(`${DiscordEmojis.SERVER} Ban Report:`);
		embedDm.setColor(EmbedColors.MAIN);
		embedDm.setThumbnail(context.guild.iconUrl);
		embedDm.setDescription(
			`Has sido baneado de \`${context.guild.name}\`\n**Moderador:** \`${
				context.member.tag
			}\`\n**Duración:** \`${
				args.time ? args.time : 'Permanente'
			}\`\n**Motivo:** \`${reason}\``
		);
		embedDm.setTimestamp();
		let memberDm = true;
		const confirm = new Confirmation(context, {
			onAskingMessage: `**Quieres banear a ${member}${
				args.time ? ` durante ${args.time}` : ''
			}?**`,
			timeout: 10000,
			onConfirm: async () => {
				await context.client.rest
					.createGuildBan(context.guildId, User.id, {
						reason: reason,
						deleteMessageDays: args.clear ? '7' : '0',
					})
					.then(async () => {
						await User.createMessage({ embeds: [embedDm] })
							.catch(() => (memberDm = false))
							.then(() => {
								let embed = new Embed()
									.setDescription(
										`${DiscordEmojis.BLOCKUSER} \`${
											User.tag
										}\` ha sido baneado${
											args.time ? ` durante ${args.time}` : ''
										}`
									)
									.setFooter('El usuario fue notificado por DMs')
									.setColor(EmbedColors.BLANK);
								context.editOrReply({ embeds: [embed] });
								this.sendLogEmbed(context, memberDm, member, reason, {
									time: args.time,
									deleteMessageDays: args.clear,
									hack: !(User instanceof Structures.Member),
								});
							});
					});
				if (bantime) {
					setTimeout(() => {
						context.client.rest
							.removeGuildBan(context.guildId, member.id, {
								reason: `Ban timed out - ${context.member.tag}`,
							})
							.catch(() => null);
					}, bantime);
				}
				return;
			},
			onCancel: () => {
				return context.editOrReply({
					embeds: [
						new Embed()
							.setTitle(`Accion Cancelada`)
							.setColor(EmbedColors.BLANK),
					],
				});
			},
			onTimeout: () => {
				return context.editOrReply({
					embeds: [
						new Embed()
							.setTitle(`Accion Cancelada | Timeout`)
							.setColor(EmbedColors.BLANK),
					],
				});
			},
		});
		return confirm.start();
	}
	async canBanMembers(member: Structures.Member, target: Structures.Member) {
		if (target.isClientOwner || config.devsIds.includes(target.id)) return false;
		if(target.isOwner) return false;
		const { Users } = await CacheCollection.getOrFetch(member.guildId);

		if (Users.Trusted.includes(target.id)) return false;
		if (Users.Trusted.includes(member.id)) return true;

		if (member.isClientOwner) return true;
		if (member.canEdit(target)) return false;

		return false;
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

	async sendLogEmbed(
		context: Command.Context,
		memberDm: boolean,
		target: Structures.Member | Structures.User,
		reason: string,
		args: {
			time?: string;
			deleteMessageDays?: boolean;
			hack?: boolean;
		} = {}
	) {
		let serverData = await CacheCollection.getOrFetch(context.guildId);
		const channelId = serverData.Channels.ModLog;
		if (channelId.length && context.guild.channels.has(channelId)) {
			const embed = new Embed();
			embed.setTitle(
				`${DiscordEmojis.BLOCKUSER}${args.hack ? 'Hack' : ''} Ban Result:`
			);
			embed.setColor(EmbedColors.MAIN);
			embed.setThumbnail(target.avatarUrl);
			embed.setDescription(
				`${target.mention} | \`${target.id}\` ha sido baneado${
					args.time ? ` durante ${args.time}` : ''
				}\n**Moderador:** \`${
					context.member.tag
				}\`\n**Motivo:** \`${reason}\`\n\n**Mas detalles:**\n${
					DiscordEmojis.CLOCK
				} Fecha: <t:${Math.floor(Date.now() / 1000)}:R>\n${
					DiscordEmojis.BLOCKUSER
				} Usuario avisado: ${
					memberDm ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO
				}\n${DiscordEmojis.CHAT} Delete Message Days?: ${
					args.deleteMessageDays ? DiscordEmojis.CHECK : DiscordEmojis.CHECK_NO
				}`
			);
			return context.guild.channels
				.get(channelId)
				.createMessage({ embeds: [embed] });
		}
	}
}
