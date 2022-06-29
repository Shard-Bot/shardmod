import { Command } from 'detritus-client';
import { Embed, Markup } from 'detritus-client/lib/utils';
import { EmbedColors } from '../../utils/constants';

export class BaseCommand<
	ParsedArgsFinished = Command.ParsedArgs
> extends Command.Command<ParsedArgsFinished> {
	permissionsIgnoreClientOwner = true;
	triggerTypingAfter = 2000;

	onPermissionsFail(context: Command.Context) {
		return context.editOrReply(
			'⚠ | No tienes los permisos necesarios para ejecutar este comando'
		);
	}
	async onRatelimit(context: Command.Context, ratelimits: Array<Command.CommandRatelimitInfo>) {
		for (const { ratelimit, remaining } of ratelimits) {
			await context.reply(
				['channel', 'guild'].includes(ratelimit.type as string)
					? 'Van demasiado rapido, esperen'
					: 'Vas demasiado rapido, espera' + ` ${(remaining / 1000).toFixed(1)} segundos.`
			);
		}
	}

	async onRunError(context: Command.Context, args: ParsedArgsFinished, error: any) {
		const embed = new Embed();
		embed.setTitle(`Error al ejecutar el comando`);
		embed.setDescription(Markup.codestring(error.toString()));

		console.log(error);

		return context.editOrReply({ embed });
	}

	onTypeError(context: Command.Context, args: ParsedArgsFinished, errors: Command.ParsedErrors) {
		const message = `**Error de Argumentos**\nUso correcto:\n${Markup.codeblock(`${context.command.name} ${context.command.metadata.usage}`)}`;
		return context.editOrReply(message)
	}
}