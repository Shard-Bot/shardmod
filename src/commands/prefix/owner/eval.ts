import { Command, CommandClient } from 'detritus-client';
import { BaseCommand } from '../basecommand';
import config from '../../../../config.json';
import { inspect } from 'util'
import { Markup } from 'detritus-client/lib/utils';
import { exec } from 'child_process';
export const COMMAND_NAME = 'eval';
interface commandArgs {
	eval: string;
	async: boolean;
	exec: boolean;
}

export default class EvalCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['ev'],
			args: [{ name: 'async', type: Boolean }, { name: 'exec', type: Boolean }],
			label: 'eval',
			metadata: {
				description: 'Ejecuta un código',
				type: 'owner',
			},
		});
	}

	onBeforeRun(context: Command.Context) {
		return !!context.user.isClientOwner
	}

	onCancelRun(context: Command.Context) {
		return context.editOrReply('Exclusivo para desarrolladores');
	}

	async run(context: Command.Context, args: commandArgs) {
		if (!args.eval) return context.editOrReply('Escribe el codigo');
		if(args.async && args.exec) return;
		if(args.exec){
			exec(args.eval, (error, stdout) => {
				return context.editOrReply(Markup.codeblock(String(stdout || error), { language:'js'}))
			})
		} else {
			let message: string;
			let type: string;
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
				type = 'json';
			}
		} catch (error: any) {
			message = inspect( error, { depth: 9 })
		}
		return context.editOrReply(Markup.codeblock(String(message), { language: `${type || 'js'}`}));
	}
		
	}
}
