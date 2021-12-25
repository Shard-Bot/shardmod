import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Paginator } from '../../../utils/paginador';
import { Embed, intToHex } from 'detritus-client/lib/utils';
import { Model } from '../../../schemas/serverconfig';
import { EmbedColors } from '../../../utils/constants';

export const COMMAND_NAME = 'whitelist show';
type param = {
   module: string;
};
export default class WhitelistShowCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['wl show'],
         args: [{name: 'module', aliases:['sistema'], type: String}],
         disableDm: true,
         metadata: {
            description: 'Muestra las Whitelists del servidor',
            usage: [`${COMMAND_NAME} (-module <sistema>)`],
            example: [
               `${COMMAND_NAME}`,
               `${COMMAND_NAME} -module antiflood`
            ],
            type: 'botconfig',
         },
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }

   async run(context: Command.Context, args: param) {
       const document = await Model.findOne({ServerID: context.guildId});
       const AntinukeWhitelist = document.Modules.AntiNuker.Whitelist
      const AutomodWhitelist = document.Modules.Automod.Whitelist
      const AntiWallTextWhitelist = document.Modules.AntiWallText.Whitelist
      const AntiCapsWhitelist = document.Modules.AntiCaps.Whitelist
      const AntiFloodWhitelist = document.Modules.AntiFlood.Whitelist
      const AntiLinksWhitelist = document.Modules.AntiLinks.Whitelist

       const embed = new Embed()
       embed.setColor(EmbedColors.MAIN)
       if(args.module && args.module.length){
         switch (args.module.toLowerCase()) {
           case "antinuke":
           case "antinuker":
             embed.setTitle('Antinuke Whitelists:')
             embed.addField(`Usuarios: (${AntinukeWhitelist.Users.length}/10)`, AntinukeWhitelist.Users.length ? AntinukeWhitelist.Users.map((userId:string) => `• <@${userId}>`).join('\n') : '`Sin Usuarios`', true)

            embed.addField(`Roles: (${AntinukeWhitelist.Roles.length}/10)`, AntinukeWhitelist.Roles.length ? AntinukeWhitelist.Roles.map((roleId:string) => `• <@&${roleId}>`).join('\n') : '`Sin Roles`', true)

             break;
           case "automod":
             embed.setTitle('Automod Whitelists:')
             embed.addField(`Usuarios: (${AutomodWhitelist.Users.length}/10)`, AutomodWhitelist.Users.length ? AutomodWhitelist.Users.map((userId:string) => `• <@${userId}>`).join('\n') : '`Sin Usuarios`', true)

            embed.addField(`Roles: (${AutomodWhitelist.Roles.length}/10)`, AutomodWhitelist.Roles.length ? AutomodWhitelist.Roles.map((roleId:string) => `• <@&${roleId}>`).join('\n') : '`Sin Roles`', true)

              embed.addField(`Canales: (${AutomodWhitelist.Channels.length}/10)`, AutomodWhitelist.Channels.length ? AutomodWhitelist.Channels.map((channelId:string) => `• <#${channelId}>`).join('\n') : '`Sin Canales`', true)
             break;
           case "antiwalltext":
             embed.setTitle('AntiWallText Whitelists:')
             embed.addField(`Usuarios: (${AntiWallTextWhitelist.Users.length}/10)`, AntiWallTextWhitelist.Users.length ? AntiWallTextWhitelist.Users.map((userId:string) => `• <@${userId}>`).join('\n') : '`Sin Usuarios`', true)

            embed.addField(`Roles: (${AntiWallTextWhitelist.Roles.length}/10)`, AntiWallTextWhitelist.Roles.length ? AntiWallTextWhitelist.Roles.map((roleId:string) => `• <@&${roleId}>`).join('\n') : '`Sin Roles`', true)

              embed.addField(`Canales: (${AntiWallTextWhitelist.Channels.length}/10)`, AntiWallTextWhitelist.Channels.length ? AntiWallTextWhitelist.Channels.map((channelId:string) => `• <#${channelId}>`).join('\n') : '`Sin Canales`', true)
           break;
           case "antiflood":
             embed.setTitle('AntiFlood Whitelists:')
             embed.addField(`Usuarios: (${AntiFloodWhitelist.Users.length}/10)`, AntiFloodWhitelist.Users.length ? AntiFloodWhitelist.Users.map((userId:string) => `• <@${userId}>`).join('\n') : '`Sin Usuarios`', true)

            embed.addField(`Roles: (${AntiFloodWhitelist.Roles.length}/10)`, AntiFloodWhitelist.Roles.length ? AntiFloodWhitelist.Roles.map((roleId:string) => `• <@&${roleId}>`).join('\n') : '`Sin Roles`', true)

              embed.addField(`Canales: (${AntiFloodWhitelist.Channels.length}/10)`, AntiFloodWhitelist.Channels.length ? AntiFloodWhitelist.Channels.map((channelId:string) => `• <#${channelId}>`).join('\n') : '`Sin Canales`', true)
           break;
           case "anticaps":
             embed.setTitle('AntiCaps Whitelists:')
             embed.addField(`Usuarios: (${AntiCapsWhitelist.Users.length}/10)`, AntiCapsWhitelist.Users.length ? AntiCapsWhitelist.Users.map((userId:string) => `• <@${userId}>`).join('\n') : '`Sin Usuarios`', true)

            embed.addField(`Roles: (${AntiCapsWhitelist.Roles.length}/10)`, AntiCapsWhitelist.Roles.length ? AntiCapsWhitelist.Roles.map((roleId:string) => `• <@&${roleId}>`).join('\n') : '`Sin Roles`', true)

              embed.addField(`Canales: (${AntiCapsWhitelist.Channels.length}/10)`, AntiCapsWhitelist.Channels.length ? AntiCapsWhitelist.Channels.map((channelId:string) => `• <#${channelId}>`).join('\n') : '`Sin Canales`', true)
           break;
           case "antilinks":
             embed.setTitle('AntiLinks Whitelists:')
             embed.addField(`Usuarios: (${AntiLinksWhitelist.Users.length}/10)`, AntiLinksWhitelist.Users.length ? AntiLinksWhitelist.Users.map((userId:string) => `• <@${userId}>`).join('\n') : '`Sin Usuarios`', true)

            embed.addField(`Roles: (${AntiLinksWhitelist.Roles.length}/10)`, AntiLinksWhitelist.Roles.length ? AntiLinksWhitelist.Roles.map((roleId:string) => `• <@&${roleId}>`).join('\n') : '`Sin Roles`', true)

              embed.addField(`Canales: (${AntiLinksWhitelist.Channels.length}/10)`, AntiLinksWhitelist.Channels.length ? AntiLinksWhitelist.Channels.map((channelId:string) => `• <#${channelId}>`).join('\n') : '`Sin Canales`', true)
           break;
           default:
             return context.editOrReply('Especifica un modulo valido')
             break;
         }
         return context.editOrReply({embeds: [embed]})
       }

      

      const modules = [{name: "Antinuke", value: AntinukeWhitelist}, {name: "Automod", value: AutomodWhitelist}, {name: "AntiWallText", value: AntiWallTextWhitelist}, {name: "AntiCaps", value: AntiCapsWhitelist}, {name: "AntiFlood", value: AntiFloodWhitelist}, {name: "AntiLinks", value: AntiLinksWhitelist}]

      const pageLimit = modules.length;
      const paginator = new Paginator(context, {
         targets: [context.member!],
         expire: 60000,
         pageLimit,
         onPage: (page) => {
            const module = modules[page - 1];
            const embed = new Embed();
            embed.setTitle(module.name)
            embed.setColor(EmbedColors.MAIN)
            embed.setFooter(`Pagina ${page} de ${pageLimit}`)
            const ModuleRole = module.value.Roles;
            const ModuleUser = module.value.Users;
            const ModuleChannel = module.value.Channels;

            embed.addField(`Usuarios: (${ModuleUser.length}/10)`, ModuleUser.length ? ModuleUser.map((userId:string) => `• <@${userId}>`).join('\n') : '`Sin Usuarios`', true)
            embed.addField(`Roles: (${ModuleRole.length}/10)`, ModuleRole.length ? ModuleRole.map((roleId:string) => `• <@&${roleId}>`).join('\n') : '`Sin Roles`', true)
            if(module.name !== 'Antinuke'){
              embed.addField(`Canales: (${ModuleChannel.length}/10)`, ModuleChannel.length ? ModuleChannel.map((channelId:string) => `• <#${channelId}>`).join('\n') : '`Sin Canales`', true)
             }     
            return embed;
         },
      });
      return await paginator.start();
   }
}
