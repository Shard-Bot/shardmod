import { Command, CommandClient } from 'detritus-client';
import { BaseCommand } from '../basecommand';
import config from '../../../../config.json';

export const COMMAND_NAME = 'reload cmd';
export default class EvalCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['reload commands'],
			metadata: {
				description: 'Recarga los comandos del bot',
				type: 'owner',
			},
		});
	}

	onBeforeRun(context: Command.Context) {
		return config.devsIds.includes(context.userId);
	}

	onCancelRun(context: Command.Context) {
		return context.editOrReply('Exclusivo para desarrolladores');
	}

	async run(context: Command.Context) {
		context.commandClient
			.resetCommands()
			.catch(() => {
				return context.editOrReply('Error al recargar comandos');
			})
			.then(() => {
				return context.editOrReply('Done');
			});
	}
}
