import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed, intToHex } from 'detritus-client/lib/utils';
import { getUserByText } from '../../../utils/functions';
import { EmbedColors } from '../../../utils/constants';
import mongoose from 'mongoose';
import { Model } from '../../../schemas/serverconfig';
import CacheCollection from '../../../cache/CacheCollection';
export const COMMAND_NAME = 'trusted show';

export default class TrustedShowCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['t show'],
			disableDm: true,
			metadata: {
				trustedOnly: true,
				description: 'Muestra la lista trusted del servidor',
				example: [COMMAND_NAME],
				type: 'botConfig',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	async run(context: Command.Context) {
		const document = await CacheCollection.getOrFetch(context.guildId);
		if (!document.Users.Trusted.length)
			return context.editOrReply('ℹ️ | No hay usuarios en la base de datos');

		const embed = new Embed();
		embed.setTitle(`TRUSTEDS: (${document.Users.Trusted.length}/5)`);
		embed.setColor(EmbedColors.MAIN);
		embed.setDescription(
			document.Users.Trusted.map(
				(user: string, i: number) => `**${i + 1}** • <@${user}>`
			).join('\n')
		);
		context.editOrReply({ embeds: [embed] });
	}
}
