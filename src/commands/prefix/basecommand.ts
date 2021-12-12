import { Command } from 'detritus-client';
import { Embed, Markup } from 'detritus-client/lib/utils';

export class BaseCommand<ParsedArgsFinished = Command.ParsedArgs> extends Command.Command<ParsedArgsFinished> {
  permissionsIgnoreClientOwner = true;
  triggerTypingAfter = 2000;

  async onRatelimit(
    context: Command.Context,
    ratelimits: Array<Command.CommandRatelimitInfo>
  ) {
    for (const { ratelimit, remaining } of ratelimits) {
      await context.reply(
        ['channel', 'guild'].includes(ratelimit.type as string)
          ? 'Van demasiado rapido, esperen'
          : 'Vas demasiado rapido, espera'
          + ` ${(remaining / 1000).toFixed(1)} segundos.`
      )
    }
  }

  async onRunError(context: Command.Context, args: ParsedArgsFinished, error: any) {
    const embed = new Embed();
    embed.setTitle(`Error al ejecutar el comando`);
    embed.setDescription(Markup.codestring(error.toString()));

    return context.editOrReply({ embed });
  }

  onTypeError(context: Command.Context, args: ParsedArgsFinished, errors: Command.ParsedErrors) {
    const embed = new Embed();
    embed.setTitle('Error de argumentos');

    const store: { [key: string]: string } = {};

    const description: Array<string> = ['Argumentos inválidos:' + '\n'];
    for (const key in errors) {
      const message = errors[key].message;
      if (message in store) {
        description.push(`**${key}**: Igual a **${store[message]}**`);
      } else {
        description.push(`**${key}**: ${message}`);
      }
      store[message] = key;
    }

    embed.setDescription(description.join('\n'));

    return context.editOrReply({ embed });
  }
}