import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { BotLogs } from '../../../utils/constants';
import { getGuildChannel } from '../../../utils/functions';
import CacheCollection from '../../../cache/CacheCollection';
import { Model } from '../../../schemas/serverconfig';
export const COMMAND_NAME = 'log add';
type param = {
   channel: string,
   event: string,
};

export default class logAddCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['l add'],
         args: [{ name: 'event', type: String, required: true, aliases: ['evento'] }],
         disableDm: true,
         label: 'channel',
         metadata: {
            description: 'Establece el canal para logeo de acciones del servidor',
            usage: [`${COMMAND_NAME} <channel> < -event <evento de log> >`],
            example: [`${COMMAND_NAME} #bienvenidas -event Joins`],
            type: 'Bot Config',
         },
         permissions: [Permissions.MANAGE_GUILD],
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }
   onBeforeRun(context: Command.Context, args: param) {
      return !!args.channel.length;
   }

   onCancelRun(context: Command.Context, args: param) {
      return context.editOrReply('⚠ | Especifica el Canal');
   }
   async run(context: Command.Context, args: param) {
      const target = await getGuildChannel(context, args.channel);
      if (!target) return context.editOrReply('⚠ | No pude encontrar el Canal');
      if(!target.isText) return context.editOrReply('⚠ | El canal debe ser de tipo Texto');
      const document = CacheCollection.get(context.guildId)
      const event = args.event;

      switch (event.toLocaleLowerCase()) {
          case "entradas":
          case "joins":
              if(document.Channels.JoinLog === target.id) return context.editOrReply('El Canal ya se encuentra establecido en este evento')
               await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.JoinLog`]: target.id },
                     })
                return context.editOrReply(`Canal \`${target.name}\` fue correctamente establecido en el evento JoinLog`)
          break;
          case "salidas":
          case "leaves":
          case "exitlog":
              if(document.Channels.ExitLog === target.id) return context.editOrReply('El Canal ya se encuentra establecido en este evento')
               await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.ExitLog`]: target.id },
                     })
                return context.editOrReply(`Canal \`${target.name}\` fue correctamente establecido en el evento ExiLog`)
          break;
          case "modactions":
          case "modlog":
              if(document.Channels.ModLog === target.id) return context.editOrReply('El Canal ya se encuentra establecido en este evento')
               await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.ModLog`]: target.id },
                     })
                return context.editOrReply(`Canal \`${target.name}\` fue correctamente establecido en el evento ModLog`)
          break;
          case "botactions":
          case "botlogs":
              if(document.Channels.BotLog === target.id) return context.editOrReply('El Canal ya se encuentra establecido en este evento')
               await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.BotLog`]: target.id },
                     })
                return context.editOrReply(`Canal \`${target.name}\` fue correctamente establecido en el evento BotLog`)
          break;
          case "all":
              const success:string[] = []
              for(const _module of BotLogs){
                if(document.Channels[_module] !== target.id){
                  await Model.findOneAndUpdate(
                     { ServerID: context.guildId },{ $set: { [`Channels.${_module}`]: target.id },
                     })
                     success.push(_module)
                }
              }
              if(success.length){
                  return context.editOrReply(`El Canal \`${target.name}\` correctamente establecido en el evento: \`${success.join(' ')}\``)
              } else {
                  return context.editOrReply('El Canal ya se encuentra establecido en cada evento')
              }
          break;
          default:
            return context.editOrReply('Especifica un modulo valido');
      }
   }
   onSuccess(context: Command.Context){
      CacheCollection.loadData(context.guildId!)
   }
}