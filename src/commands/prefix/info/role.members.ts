import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed } from 'detritus-client/lib/utils';
import { EmbedColors } from '../../../utils/constants';
import { getGuildRole } from '../../../utils/functions';
import { Paginator } from '../../../utils/paginator';

export const COMMAND_NAME = 'inrole';
type param = {
	role: string;
};

export default class InroleCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['role members', 'withrole'],
			label: 'role',
			disableDm: true,
			metadata: {
				description: 'Muestra todos los usuarios que poseen un rol específico.',
				usage: '[Rol]',
				example: [`${COMMAND_NAME} @role`],
				type: 'info',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	onBeforeRun(context: Command.Context, args: param) {
		return !!args.role.length;
	}
	onCancelRun(context: Command.Context) {
		return context.editOrReply('⚠ | Especifica el rol que quieres buscar.');
	}
	async run(context: Command.Context, args: param) {
		const role = (context.message.mentionRoles.first() as Structures.Role) || await getGuildRole(context, args.role);
		
		if (!role) return context.editOrReply('⚠ | No pude encontrar el rol');
		
		const members = role.members.toArray();
		if (!members.length)
			return context.editOrReply('⚠ | Este rol no tiene miembros.');

		if (members.length <= 20) {
			return context.editOrReply({
				embeds: [await this.generateRoleMembersEmbed(role, members, 0)],
			});
		}

		const paginator = new Paginator(context, {
			lastPage: Math.round(members.length / 20),
			onPage: async (page) => {
				return (await this.generateRoleMembersEmbed(role, members, page * 20)).setFooter(`Página ${page + 1}/${Math.round(members.length / 20)}`);
			},
		});

		return paginator.update();
	}
	async generateRoleMembersEmbed(
		role: Structures.Role,
		members: Array<Structures.Member>,
		start: number
	) {
		const current = members.slice(start, start + 20);

		return new Embed()
			.setTitle(`Usuarios con el rol ${role.name} (${members.length})`)
			.setDescription(current.map((member) => member.mention).join(', '))
			.setColor(role.color || EmbedColors.MAIN)
			.setThumbnail(role.iconUrl);
	}
}
