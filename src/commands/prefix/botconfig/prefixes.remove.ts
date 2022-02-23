import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { getUserByText } from '../../../utils/functions';
import { Model } from '../../../schemas/serverconfig';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'prefixes remove';
type param = {
    prefix: string;
};

export default class prefixSetCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['removeprefix', 'prefix delete', 'prefix del', 'prefix rm'],
         disableDm: true,
         label: 'prefix',
         metadata: {
            description: 'Elimina un prefix de la lista de prefixes del servidor',
            usage: [`${COMMAND_NAME} <prefix>`],
            example: [`${COMMAND_NAME} s!`],
            type: 'Bot Config',
         },
         permissions: [Permissions.MANAGE_GUILD],
         permissionsClient: [Permissions.SEND_MESSAGES],
      });
   }
   onBeforeRun(context: Command.Context, args: param) {
      return !!args.prefix.length;
   }

   onCancelRun(context: Command.Context, args: param) {
      return context.editOrReply('⚠ | Especifica el prefix');
   }
   async run(context: Command.Context, args: param) {
      const guildData = CacheCollection.get(context.guildId)
      if(!guildData.Prefixes.includes(args.prefix)) return context.editOrReply('⚠ | Ese prefix no se encuentra establecido')
      await Model.findOneAndUpdate(
        { ServerID: context.guildId },{ $pull: { [`Prefixes`]: args.prefix },
        })
      return context.editOrReply(`El prefix \`${args.prefix}\` fue removido de la lista de prefixes del servidor`)
   }
}
