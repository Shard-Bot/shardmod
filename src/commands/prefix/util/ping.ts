import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';

export const COMMAND_NAME = 'ping';

export default class PingCommand extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: COMMAND_NAME,
      aliases: ['latency'],
      metadata: {
        description: 'Obtiene info de la latencia del bot',
        type: 'info',
      },
      permissionsClient: [Permissions.EMBED_LINKS],
    });
  }

  async run(context: Command.Context) {
    const { gateway, rest } = await context.client.ping();

    return context.editOrReply({
      content: `Pong! (gateway: ${gateway}ms) (rest: ${rest}ms)`,
      reference: true,
    })
  }
}