import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed } from 'detritus-client/lib/utils';
import CacheCollection from '../../../cache/CacheCollection';
import { EmbedColors } from '../../../utils/constants';

export const COMMAND_NAME = 'prefixes show';
type param = {
    prefix: string;
};

export default class prefixSetCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
			name: COMMAND_NAME,
			aliases: [
				'showprefixs',
				'showprefixes',
				'prefix display',
				'display prefixes',
				'prefixes list',
				'prefix list',
			],
			disableDm: true,
			label: 'prefix',
			metadata: {
				description: 'Muestra la lista de prefixes del servidor',
				example: [COMMAND_NAME],
				type: 'botConfig',
			},
			permissions: [Permissions.MANAGE_GUILD],
			permissionsClient: [Permissions.EMBED_LINKS],
		});
   }
   async run(context: Command.Context, args: param) {
      const guildData = await CacheCollection.getOrFetch(context.guildId)
      const embed = new Embed();
      embed.setTitle(`Custom Prefixes List [${guildData.Prefixes.length}/5]`)
      embed.setColor(EmbedColors.MAIN)
      embed.setDescription(guildData.Prefixes.map((prefix, i) => `**${i + 1} •** \`${prefix}\``).join('\n') || '`Sin prefixes custom`')
      return context.editOrReply({embeds: [embed]});
   }
}
