import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed, EmbedAuthor } from 'detritus-client/lib/utils';
import { Model } from '../../../schemas/serverconfig';
import { EmbedColors, AntiNukesModules, DiscordEmojis, BotModules } from '../../../utils/constants';
import CacheCollection, { cacheClass } from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'antinuke';
type param = {
   status: boolean,
};

export default class AntinukesToggleCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['an', 'antinuker', 'antinukes'],
         disableDm: true,
         args: [
            { name: 'status', type: Boolean, required: false, aliases: ['estado'] },
         ],
         metadata: {
            trustedOnly: true,
            description: 'Comando para activar/desactivar el sistema Antinuke',
            usage: [`${COMMAND_NAME} [-status]`],
            example: [
               `${COMMAND_NAME}`,
               `${COMMAND_NAME} -status`,
            ],
            type: 'Anti Raid',
         },
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }
   async run(context: Command.Context, args: param) {
      let serverData = CacheCollection.get(context.guildId)
      if(args.status){
         let embed = new Embed();
         embed.setColor(EmbedColors.MAIN)
         embed.setTitle(`Antinuke Status ${serverData.Modules.AntiNuker.Enabled === true ? DiscordEmojis.ON : DiscordEmojis.OFF}`)
         embed.setFooter(`El sistema esta actualmente ${serverData.Modules.AntiNuker.Enabled === true ? 'encendido' : 'apagado'}`)
         let disabledEvents:string[] = [];
         let enabledEvents:string[] = [];
         for(let module of Object.values(AntiNukesModules)){
            if(serverData.Modules.AntiNuker.Config[module].Enabled === true) enabledEvents.push(`\`${module}\``)
            else disabledEvents.push(`\`${module}\``);
         }
         embed.addField(`• Eventos Activados [${enabledEvents.length}]:`, enabledEvents.join(' ') || '`No hay eventos activados`') 
         embed.addField(`• Eventos Desactivados [${disabledEvents.length}]:`, disabledEvents.join(' ') || '`No hay eventos desactivados`') 
         return context.editOrReply({
            embeds: [embed]
         })
      }
      await Model.findOneAndUpdate(
         { ServerID: context.guildId },{ $set: { [`Modules.AntiNuker.Enabled`]: (serverData.Modules.AntiNuker.Enabled === true ? false : true) },
         })
       return context.editOrReply(`El sistema Antinuke ha sido ${serverData.Modules.AntiNuker.Enabled === true ? 'desactivado' : 'activado'}`)
   }
}
