import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { BotLogs, EmbedColors } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';
import { Embed } from 'detritus-client/lib/utils';
import { clearString } from '../../../utils/functions';
export const COMMAND_NAME = 'log show';

export default class logShowCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['l show'],
			disableDm: true,
			label: 'channel',
			metadata: {
				description: 'Muestra los canales establecidos en el servidor',
				example: [COMMAND_NAME],
				type: 'botConfig',
			},
			permissions: [Permissions.MANAGE_GUILD],
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	async run(context: Command.Context) {
		const document = await CacheCollection.getOrFetch(context.guildId);
		const embed = new Embed();
		embed.setTitle('Log Channels');
		embed.setColor(EmbedColors.MAIN);
		for (const _module of BotLogs) {
			if (document.Channels[_module].length) {
				embed.addField(
					clearString(_module),
					`• <#${document.Channels[_module]}>`,
					true
				);
			} else {
				embed.addField(clearString(_module), '`Sin Establecer`', true);
			}
		}
		return context.editOrReply({ embeds: [embed] });
	}
}
