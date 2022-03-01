import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Model } from '../../../schemas/serverconfig';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'automod add';
type param = {
	word: string;
	percent: number;
};

export default class AutomodAddCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['addword', 'badword add'],
			disableDm: true,
			label: 'word',
			args: [
				{
					name: 'percent',
					type: Number,
					required: false,
					aliases: ['porcentaje'],
					default: 25,
				},
			],
			metadata: {
                trustedOnly: true,
				disableDm: true,
				description: 'Añade una palabra (o palabras) a la lista de automod del servidor',
				usage: [`${COMMAND_NAME} <palabra> [-Percent]`],
				example: [`${COMMAND_NAME} fatand tonto -Percent 100%`],
				type: 'Bot Config',
			},
			permissionsClient: [Permissions.SEND_MESSAGES],
		});
	}
	onBeforeRun(context: Command.Context, args: param) {
		return !!args.word.length;
	}

	onCancelRun(context: Command.Context, args: param) {
		return context.editOrReply('⚠ | Especifica la palabra');
	}
	async run(context: Command.Context, args: param) {
		const guildData = CacheCollection.get(context.guildId);
		const words = guildData.Modules.Automod.Words;
		if (words.length > 20)
			return context.editOrReply('⚠ | El servidor alcanzo el maximo de palabras en el automod');
		if (words.find(({ Word }) => args.word.toLowerCase() === Word))
			return context.editOrReply('⚠ | Esa palabra ya se encuentra establecida');
		if (args.word.length > 20)
			return context.editOrReply('⚠ | La palabra no puede contener mas de 20 caracteres');
		await Model.findOneAndUpdate(
			{ ServerID: context.guildId },
			{
				$push: {
					['Modules.Automod.Words']: {
						Word: args.word.toLowerCase(),
						Percent: args.percent,
					},
				},
			}
		);
		return context.editOrReply(
			`Se añadio \`${args.word}\` con un porcentaje del \`${args.percent}%\` a la lista automod`
		);
	}
}