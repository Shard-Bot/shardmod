import { Command, CommandClient } from 'detritus-client';
import { inspect } from 'util';
import { BaseCommand } from '../basecommand';
import config from '../../../../config.json';

export const COMMAND_NAME = 'eval'

interface Args {
  eval: string;
}

export default class EvalCommand extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: COMMAND_NAME,
      aliases: ['ev'],
      metadata: {
        description: 'Ejecuta un código',
        examples: [
          `${COMMAND_NAME} this`
        ],
        type: 'owner',
      }
    });
  }

  onBeforeRun(context: Command.Context) {
    return config.devsIds.includes(context.userId)
  }

  onCancelRun(context: Command.Context) {
    return context.editOrReply('Exclusivo para desarrolladores');
  }

  async run(context: Command.Context, args: Args) {
    if (!args?.eval) return context.reply('Escribe un código')

    try {
      const evaled = eval(args.eval)
      context.editOrReply({ content: `**Tipo**: \`\`\`prolog\n${typeof (evaled)}\`\`\`\n**Resultado:**\`\`\`js\n${inspect(evaled, { depth: 0 })}\`\`\`` })
      console.dir(evaled, { depth: 0 })
    } catch (error) {
      console.log(error)
      context.editOrReply({ content: `**Resultado:**\`\`\`js\n${error}\`\`\`` })
    }
  }
}