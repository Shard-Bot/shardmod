import { Command, CommandClient, Structures } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import { getUserByText } from '../../../utils/functions';
import { Embed } from 'detritus-client/lib/utils';
import { defaultData, Model } from '../../../schemas/guildwarns';
import { GuildWarns } from '../../../utils/types';
import { Paginator } from '../../../utils/paginator';

export const COMMAND_NAME = 'warns';
type param = {
	userOrWarn: string;
};

export default class GuildWarnsCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['guild warns', 'server warns', 'warn info', 'warninfo', 'userwarn'],
			disableDm: true,
			label: 'userOrWarn',
			metadata: {
				description: 'Muestra la lista de avisos del servidor o de un miembro especifico',
				usage: '[Miembro|Warn ID]',
				example: [`${COMMAND_NAME} fatand#3431`, `${COMMAND_NAME} NrCBQ`],
				type: 'moderation',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	onBeforeRun(context: Command.Context) {
		const hasPermissions =
			context.member.can(Permissions.MANAGE_GUILD) ||
			context.member.can(Permissions.KICK_MEMBERS) ||
			context.member.can(Permissions.BAN_MEMBERS) ||
			context.member.isClientOwner;

		return hasPermissions;
	}

	onCancelRun(context: Command.Context, args: any) {
		return context.editOrReply('⚠ | No tienes permiso para usar este comando');
	}

	async run(context: Command.Context, args: param) {
		const data =
			(await Model.findOne({ ServerID: context.guildId })) ??
			(await Model.create(defaultData(context.guildId)));
		const warns = data.Warns.reverse();

		if (!warns.length)
			return context.editOrReply(':warning: El servidor no tiene avisos registrados');

		if (args.userOrWarn) {
			const user =
				context.message.mentions.first() || (await getUserByText(context, args.userOrWarn));

			const warn: GuildWarns['Warns'][0] = warns.find(
				({ id }) => id.toLowerCase() === args.userOrWarn.toLowerCase()
			);

			if (!user && !warn)
				return context.editOrReply(
					':warning: No pude encontrar el usuario o un aviso con esa id'
				);

			if (user) {
				const userWarns = warns.filter(({ targetId }) => targetId === user.id);

				if (!userWarns.length)
					return context.editOrReply(':warning: El usuario no tiene avisos');

				if (userWarns.length <= 5)
					return context.editOrReply({
						embeds: [await this.generateUserWarnsEmbed(user, userWarns, 0)],
					});
				//return paginate(context, [context.userId], embeds.length, 60000, embeds);
				const paginator = new Paginator(context, {
					lastPage: Math.round(userWarns.length / 5),
					onPage: (page) => {
						return this.generateUserWarnsEmbed(user, userWarns, page * 5);
					},
				});

				return paginator.update();
			}

			if (!warn) return context.editOrReply(':warning: No existe un aviso con esa id');

			const target = await getUserByText(context, warn.targetId);
			const moderator = await getUserByText(context, warn.moderatorId);

			let userWarns = warns.filter(({ targetId }) => targetId === target.id);

			let embed = new Embed()
				.setTitle(`Info del warn de ${target.tag}`)
				.setThumbnail(target.avatarUrl)
				.setColor(EmbedColors.MAIN)
				.setDescription(
					[
						`**Warn ID:** \`${warn.id}\``,
						`**Moderador:** \`${moderator.tag}\``,
						`**Motivo:** \`${warn.reason}\`\n`,
						`**Mas detalles:**`,
						`${DiscordEmojis.CLOCK} Fecha: <t:${warn.date}:R>`,
						`${DiscordEmojis.RULES} Avisos totales: ${userWarns.length}`,
					].join('\n')
				);

			return context.editOrReply({ embeds: [embed] });
		}

		if (warns.length <= 5)
			return context.editOrReply({
				embeds: [await this.generateGuildWarnsEmbed(context, warns, 0)],
			});
		//return await paginate(context, [context.userId], embeds.length, 60000, embeds);
		const paginator = new Paginator(context, {
			lastPage: Math.round(warns.length / 5),
			onPage: (page) => {
				return this.generateGuildWarnsEmbed(context, warns, page * 5);
			},
		});

		return paginator.update();
	}

	async generateGuildWarnsEmbed(
		context: Command.Context,
		warns: Array<GuildWarns['Warns'][0]>,
		start: number
	) {
		const current = warns.slice(start, start + 5);

		return new Embed()
			.setTitle(`${context.guild.name}'s Warns [${warns.length}]`)
			.setDescription(
				(
					await Promise.resolve(
						current.map(
							async ({ id, targetId, date }) =>
								`**•** \`${id} - ${
									(
										await getUserByText(context, targetId)
									).tag
								}\` - <t:${date}:R>`
						)
					)
				).join('\n')
			)
			.setColor(EmbedColors.MAIN)
			.setFooter(`Mostrando ${current.length}/${warns.length} warns`);
	}
	async generateUserWarnsEmbed(
		user: Structures.Member | Structures.User,
		warns: Array<GuildWarns['Warns'][0]>,
		start: number
	) {
		const current = warns.slice(start, start + 5);
		return new Embed()
			.setTitle(`${user.tag}'s Warns [${warns.length}]`)
			.setDescription(
				current.map(({ id, date }) => `**•** \`${id}\` - <t:${date}:R>`).join('\n')
			)
			.setColor(EmbedColors.MAIN)
			.setFooter(`Mostrando ${current.length}/${warns.length} warns`);
	}
}
