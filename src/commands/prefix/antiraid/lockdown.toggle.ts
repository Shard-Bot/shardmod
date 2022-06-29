import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed } from 'detritus-client/lib/utils';
import { Model } from '../../../schemas/serverconfig';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'lockdown';
type param = {
	status: boolean;
};

export default class LockdownToggleCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['ld'],
			disableDm: true,
			args: [
				{ name: 'status', type: Boolean, required: false, aliases: ['estado'] },
			],
			metadata: {
				trustedOnly: true,
				description: 'Comando para activar/desactivar el sistema Lockdown',
				usage: '[-status]',
				example: [`${COMMAND_NAME}`, `${COMMAND_NAME} -status`],
				type: 'antiRaid',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	async run(context: Command.Context, args: param) {
		let serverData = await CacheCollection.getOrFetch(context.guildId);
		if (args.status) {
			let embed = new Embed();
			embed.setColor(EmbedColors.MAIN);
			embed.setTitle(
				`Lockdown Status ${
					serverData.Modules.Lockdown.Enabled === true
						? DiscordEmojis.ON
						: DiscordEmojis.OFF
				}`
			);
			embed.addField(
				'Status:',
				`• \`${
					serverData.Modules.Lockdown.Enabled === true
						? 'Activado'
						: 'Desactivado'
				}\``,
				true
			);
			embed.addField('Modo:', `• \`${serverData.Modules.Lockdown.Mode}\``, true);
			embed.addField(
				'Objetivo:',
				`• \`${serverData.Modules.Lockdown.Target}\``,
				true
			);
			return context.editOrReply({
				embeds: [embed],
			});
		}
		await Model.findOneAndUpdate(
			{ ServerID: context.guildId },
			{
				$set: {
					[`Modules.Lockdown.Enabled`]:
						serverData.Modules.Lockdown.Enabled === true ? false : true,
				},
			}
		);
		return context.editOrReply(
			`El sistema Lockdown ha sido ${
				serverData.Modules.Lockdown.Enabled === true ? 'desactivado' : 'activado'
			}`
		);
	}
}
