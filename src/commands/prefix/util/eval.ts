import { Command, CommandClient} from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import {inspect} from 'util';
import config from '../../../../config.json';
import { BaseCommand } from '../basecommand';


export const COMMAND_NAME = 'eval';
type eval = {
  eval: string
}
export default class EvalCommand extends BaseCommand {
	constructor(client: CommandClient) {
    super(client, {
      name: COMMAND_NAME,
      aliases: ['ev'],
      metadata: {
        description: 'si',
        examples: [
          COMMAND_NAME
        ],
        type: 'owner',
      },
      permissionsClient: [Permissions.EMBED_LINKS],
    });
  }

  onBeforeRun(context: Command.Context, args:eval|undefined) {
    return !!config.devsIds.includes(context.userId)
  }
  onCancelRun(context: Command.Context, args:eval|undefined) {
    return context.editOrReply( '⚠ Owner Only Command.');
  }

  async run(context: Command.Context, args:eval|undefined) {
    if(!args?.eval) return context.reply('Escribe un codigo')
  try{
      const evaled = eval(args.eval)
        context.editOrReply({content: `**Tipo**: \`\`\`prolog\n${typeof(evaled)}\`\`\`\n**Resultado:**\`\`\`js\n${inspect(evaled, {depth: 0})}\`\`\``})
        console.log(`${inspect(evaled, {depth: 0})}`)
    } catch (error) {
      console.log(error)
        context.editOrReply({content: `**Resultado:**\`\`\`js\n${error}\`\`\``})
    }
  }
}