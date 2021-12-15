import { Command, CommandClient } from 'detritus-client';
import { BaseCommand } from '../basecommand';
import config from '../../../../config.json';

export const COMMAND_NAME = 'eval';
interface commandArgs {
	eval: string;
	async: boolean;
}

export default class EvalCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['ev'],
			args: [{ name: 'async', type: Boolean }],
			label: 'eval',
			metadata: {
				description: 'Ejecuta un código',
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

	async run(context: Command.Context, args: commandArgs) {
		if (!args.eval) return context.editOrReply('Escribe el codigo');
		let message;
		let type;
		try {
			if (args.async) {
				const AsyncCode = Object.getPrototypeOf(async function () {}).constructor;
				const func = new AsyncCode('context', args.eval);
				message = await func(context);
			} else {
				message = await Promise.resolve(eval(args.eval));
			}
			if (typeof message === 'object') {
				message = JSON.stringify(message, null, 2);
				let type = 'json';
			}
		} catch (error: any) {
			message = error ? error.stack || error.message : error;
		}
		return context.editOrReply(`\`\`\`${type || 'js'}\n${String(message)}\`\`\``);
	}
}
