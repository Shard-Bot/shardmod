import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Model } from '../../../schemas/serverconfig';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'automod remove';
type param = {
	word: string;
};

export default class AutomodRemoveCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['delword', 'badword del', 'automod del'],
			disableDm: true,
			label: 'word',
			metadata: {
				trustedOnly: true,
				disableDm: true,
				description:
					'Remueve una palabra (o palabras) de la lista de automod del servidor',
				usage: '[Palabra]',
				example: [`${COMMAND_NAME} nicaragua`],
				type: 'botConfig',
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
		const guildData = await CacheCollection.getOrFetch(context.guildId);
		const words = guildData.Modules.Automod.Words;
		const index = words.findIndex(({ Word }) => args.word.toLowerCase() === Word);
		if (index === -1)
			return context.editOrReply('⚠ | Esa palabra no se encuentra establecida');
		await Model.findOneAndUpdate(
			{ ServerID: context.guildId },
			{
				$pull: {
					[`Modules.Automod.Words`]: { Word: `${args.word.toLowerCase()}` },
				},
			}
		);
		return context.editOrReply(`Se removio \`${args.word}\` de la lista automod.`);
	}
}
