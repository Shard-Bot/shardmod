import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed } from 'detritus-client/lib/utils';
import { Model } from '../../../schemas/serverconfig';
import { EmbedColors, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'lockdown config';
type param = {
	show: boolean;
	mode: string;
	target: string;
	status: string;
};

export default class LockdownToggleCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['ld config', 'ld c', 'lockdown c'],
			disableDm: true,
			args: [
				{
					name: 'status',
					type: String,
					required: false,
					aliases: ['s', 'estado'],
				},
				{
					name: 'target',
					type: String,
					required: false,
					aliases: ['t', 'objetivo'],
				},
				{ name: 'mode', type: String, required: false, aliases: ['m', 'modo'] },
				{
					name: 'show',
					type: Boolean,
					required: false,
					aliases: ['display', 'panel'],
				},
			],
			metadata: {
				trustedOnly: true,
				description: 'Comando de configuracion del sistema Lockdown',
				usage: '[Modulo/Sistema] [-mode] [-target] [-status] [-show]',
				example: [
					`${COMMAND_NAME} -mode ban`,
					`${COMMAND_NAME} -target alts`,
					`${COMMAND_NAME} -status off`,
					`${COMMAND_NAME} -show`,
				],
				type: 'antiRaid',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	async run(context: Command.Context, args: param) {
		const serverData = await CacheCollection.getOrFetch(context.guildId);
		if (args.show) {
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

		if (args.status) {
			if (!['on', 'off'].includes(args.status.toLowerCase()))
				return context.editOrReply('⚠ | Especifica una accion valida');
			if (
				args.status.toLowerCase() === 'on' &&
				serverData.Modules.Lockdown.Enabled === true
			)
				return context.editOrReply('⚠ | El sistema ya se encuentra encendido');

			if (
				args.status.toLowerCase() === 'off' &&
				serverData.Modules.Lockdown.Enabled === false
			)
				return context.editOrReply('⚠ | El sistema ya se encuentra apagado');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Modules.Lockdown.Enabled`]:
							args.status.toLowerCase() === 'on' ? true : false,
					},
				}
			);
			return context.editOrReply(
				`El sistema Lockdown ha sido ${
					args.status.toLowerCase() === 'on' ? 'Encendido' : 'Apagado'
				}`
			);
		}
		if (args.mode) {
			if (!['ban', 'kick', 'mute', 'timeout'].includes(args.mode.toLowerCase()))
				return context.editOrReply('⚠ | Especifica una accion valida');
			if (serverData.Modules.Lockdown.Mode === args.mode.toLowerCase())
				return context.editOrReply('⚠ | Ese modo ya se encuentra establecido');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Modules.Lockdown.Mode`]:
							args.mode.toLowerCase() === 'mute'
								? 'timeout'
								: args.mode.toLowerCase(),
					},
				}
			);
			return context.editOrReply(
				`El modo se ha cambiado a \`${args.mode.toLowerCase()}\``
			);
		}
		if (args.target) {
			if (!['all', 'alts', 'bots'].includes(args.target.toLowerCase()))
				return context.editOrReply('⚠ | Especifica una accion valida');
			if (serverData.Modules.Lockdown.Target === args.target.toLowerCase())
				return context.editOrReply(
					'⚠ | Ese objetivo ya se encuentra establecido'
				);
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Modules.Lockdown.Target`]: args.target.toLowerCase(),
					},
				}
			);
			return context.editOrReply(`El objetivo se ha cambiado a \`${args.target}\``);
		}
	}
}
