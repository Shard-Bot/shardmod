import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { Embed } from 'detritus-client/lib/utils';
import { BaseCommand } from '../basecommand';

export const COMMAND_NAME = 'bot invite';

export default class InviteCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['inv', 'invite'],
			metadata: {
				description: 'Obten la invitación del bot',
				type: 'info',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}

	async run(context: Command.Context) {
		const basicEmbed = {
			color: 0x2f3136,
		};
		const mainEmbed = new Embed(basicEmbed)
			.setTitle('Invitaciones')
			.setThumbnail(context.client.user.avatarUrl)
			.addField(
				'**Servidor de Soporte**',
				'**[Sharding](https://discord.gg/x9ENapXbyW)**'
			)
			.addField(
				'**Shard Bots**',
				'**[Moderación](https://discord.com/oauth2/authorize?client_id=848074235678031893&permissions=8&scope=bot%20applications.commands) | [Música](https://discord.com/oauth2/authorize?client_id=885570928023584809&permissions=8&scope=bot%20applications.commands)**'
			);
		return context.editOrReply({ embeds: [mainEmbed] });
	}
}
