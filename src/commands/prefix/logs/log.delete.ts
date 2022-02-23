import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { BotLogs } from '../../../utils/constants';
import { getGuildChannel } from '../../../utils/functions';
import CacheCollection from '../../../cache/CacheCollection';
import { Model } from '../../../schemas/serverconfig';
export const COMMAND_NAME = 'log remove';
type param = {
   event: string,
};

export default class logDeleteCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['l remove', 'l delete', 'log delete', 'log del'],
         args: [{ name: 'event', type: String, required: true, aliases: ['evento'] }],
         disableDm: true,
         metadata: {
            description: 'Establece el canal para logeo de acciones del servidor',
            usage: [`${COMMAND_NAME} < -event <evento de log> >`],
            example: [`${COMMAND_NAME} -event Joins`],
            type: 'Bot Config',
         },
         permissions: [Permissions.MANAGE_GUILD],
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }

   async run(context: Command.Context, args: param) {
      const document = CacheCollection.get(context.guildId)
      const event = args.event;

      switch (event.toLocaleLowerCase()) {
          case "entradas":
          case "joins":
              if(!document.Channels.JoinLog.length) return context.editOrReply('Este evento no tiene un canal establecido')
               await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.JoinLog`]: "" },
                     })
                return context.editOrReply(`Canal fue correctamente removido del evento JoinLog`)
          break;
          case "salidas":
          case "leaves":
              if(!document.Channels.JoinLog.length) return context.editOrReply('Este evento no tiene un canal establecido')
               await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.JoinLog`]: "" },
                     })
                return context.editOrReply(`Canal fue correctamente removido del evento JoinLog`)
          break;
          case "modactions":
          case "modlog":
              if(!document.Channels.JoinLog.length) return context.editOrReply('Este evento no tiene un canal establecido')
               await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.JoinLog`]: "" },
                     })
                return context.editOrReply(`Canal fue correctamente removido del evento JoinLog`)
          break;
          case "all":
              const success:string[] = []
              for(const _module of BotLogs){
                if(document.Channels[_module].length){
                  await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.${_module}`]: "" },
                     })
                     success.push(_module)
                }
              }
              if(success.length){
                  return context.editOrReply(`Los eventos \`${success.join(' ')}\` fueros correctamente removidos`)
              } else {
                  return context.editOrReply('Ningun evento tiene un canal establecido')
              }
          break;
          default:
            return context.editOrReply('Especifica un modulo valido');
      }
   }
}