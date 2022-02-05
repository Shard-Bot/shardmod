import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { getUserByText } from '../../../utils/functions';
import { Model } from '../../../schemas/serverconfig';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'prefixes add';
type param = {
    prefix: string;
};

export default class prefixSetCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['addprefix', 'prefix add'],
         disableDm: true,
         label: 'prefix',
         metadata: {
            description: 'Añade un prefix a la lista de prefixes del servidor',
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
      return context.editOrReply('⚠ | Especifica el nuevo prefix');
   }
   async run(context: Command.Context, args: param) {
      const guildData = CacheCollection.get(context.guildId)
      if(guildData.Prefixes.length > 5) return context.editOrReply('⚠ | El servidor alcanzo el maximo de prefixes')
      if(guildData.Prefixes.includes(args.prefix)) return context.editOrReply('⚠ | Ese prefix ya se encuentra establecido')
      if(args.prefix.length > 6) return context.editOrReply('⚠ | El prefix debe tener menos de 6 caracteres')
      await Model.findOneAndUpdate(
        { ServerID: context.guildId },{ $push: { [`Prefixes`]: args.prefix },
        })
      return context.editOrReply(`El prefix \`${args.prefix}\` fue añadido a la lista de prefixes del servidor`)
   }
   onSuccess(context: Command.Context){
      CacheCollection.loadData(context.guildId!)
   }
}
