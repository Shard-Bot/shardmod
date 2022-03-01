import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed } from 'detritus-client/lib/utils';
import { defaultData, Model } from '../../../schemas/guildwarns';
import { EmbedColors } from '../../../utils/constants';
import { clearString } from '../../../utils/functions';

export const COMMAND_NAME = 'warns config';
type param = {
	show: boolean;
	action: string;
	max: number;
};

export default class WarnsConfigCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['warn config'],
			disableDm: true,
			args: [
				{ name: 'max', type: Number, required: false, aliases: ['maxwarns'] },
				{ name: 'action', type: String, required: false, aliases: ['accion'] },
				{ name: 'show', type: Boolean, required: false, aliases: ['display'] },
			],
			metadata: {
				trustedOnly: true,
				description: 'Comando de configuracion del sistema de warns',
				usage: [`${COMMAND_NAME} [-max] [-action] [-show]`],
				example: [
					`${COMMAND_NAME} -max 5`,
					`${COMMAND_NAME} -action timeout`,
					`${COMMAND_NAME} -show`,
				],
				type: 'Bot Config',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	async run(context: Command.Context, args: param) {
		let data = await Model.findOne({ ServerID: context.guildId });
		if (!data) data = await Model.create(defaultData(context.guildId));
		if (args.show || (!args.action && !args.max)) {
			const embed = new Embed();
			embed.setTitle('Warns Config Panel');
			embed.setColor(EmbedColors.MAIN);
			embed.addField('Max Warns:', `• \`${data.Maxwarns}\``, true);
			embed.addField('Action:', `• \`${data.Action}\``, true);
			return context.editOrReply({ embeds: [embed] });
		}
		if (args.action) {
			if (!['ban', 'kick', 'mute', 'timeout', 'ignore'].includes(args.action.toLowerCase()))
				return context.editOrReply('⚠ | Especifica una accion valida');
			if (data.Action.toLowerCase() === args.action.toLowerCase())
				return context.editOrReply('⚠ | Esa accion ya se encuentra establecido');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Action`]:
							args.action.toLowerCase() === 'mute' ? 'Timeout' : clearString(args.action),
					},
				}
			);
			return context.editOrReply(`La acción se ha cambiado a \`${clearString(args.action)}\``);
		}
		if (args.max) {
			if (!Number.isInteger(args.max)) return context.editOrReply('⚠ | Numero invalido');
			if (args.max > 20 || args.max < 2)
				return context.editOrReply('⚠ | Especifica un porcentaje valido (entre 2 y 20)');
			if (args.max === data.Maxwarns)
				return context.editOrReply('⚠ | Ese valor ya esta establecido');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Maxwarns`]: args.max,
					},
				}
			);
			return context.editOrReply(
				`El limite de warns por miembro se ha cambiado a \`${args.max}\``
			);
		}
	}
}
