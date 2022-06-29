import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed } from 'detritus-client/lib/utils';
import { EmbedColors, PERMISSIONS, PermissionsText } from '../../../utils/constants';
import {
	getUserByText,
	permissionsToObject,
} from '../../../utils/functions';
import { codeblock } from 'detritus-client/lib/utils/markup';

export const COMMAND_NAME = 'user permissions';
type param = {
	user: string;
};

export default class InroleCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['userperms', 'permissions', 'perms'],
			label: 'user',
			disableDm: true,
			metadata: {
				description: 'Muestra los permisos de un usuario.',
				usage: '[User]',
				example: [`${COMMAND_NAME} @fatand`],
				type: 'info',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	onBeforeRun(context: Command.Context, args: param) {
		return !!args.user.length;
	}
	onCancelRun(context: Command.Context) {
		return context.editOrReply('⚠ | Especifica el usuario que quieres buscar.');
	}
	async run(context: Command.Context, args: param) {
		let User =
			(context.message.mentions.first() as Structures.Member) ||
			(args.user ? await getUserByText(context, args.user) : undefined) ||
			context.member;
		if (!User) return context.editOrReply('⚠ | No pude encontrar el usuario');

		const isMember = User instanceof Structures.Member;

		if (!isMember)
			return context.editOrReply(
				'⚠ | Este comando solo funciona con miembros del servidor.'
			);

		const member = User as Structures.Member;

		const permissions = permissionsToObject(member.permissions);

		const Perms: Array<string> = [];
		for (const permission of PERMISSIONS) {
			const key = String(permission);
			const can = permissions[key];
			if (can) Perms.push(`${PermissionsText[key]}`);
		}
		if (Perms.length === 0)
			return context.editOrReply('⚠ | Este usuario no tiene ningún permiso.');

		const embed = new Embed()
			.setTitle(`Permisos de ${member.username} (${Perms.length})`)
			.setDescription(codeblock(Perms.join(', ')))
			.setColor(member.color || EmbedColors.MAIN)
			.setThumbnail(member.avatarUrl);

		return context.editOrReply({ embed });
	}
}
