import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed, intToHex } from 'detritus-client/lib/utils';
import { EmbedColors } from '../../../utils/constants';
import { getUserByText, getGuildChannel, getGuildRole } from '../../../utils/functions';
import * as mongoose from 'mongoose';
import { Model } from '../../../schemas/serverconfig';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'whitelist remove';
type param = {
   userOrRoleOrChannel: string;
   module: string;
};

export default class WhitelistaddCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['wl rm', 'wl del', 'wl rv'],
         disableDm: true,
         args: [{ name: 'module', type: String, required: true, aliases: ['sistema'] }],
         label: 'userOrRoleOrChannel',
         metadata: {
            trustedOnly: true,
            description: 'Remueve a un Usuario|Canal|Rol de la whitelist de un modulo',
            usage: [`${COMMAND_NAME} <Miembro|Canal|Rol> <-module (sistema)>`],
            example: [
               `${COMMAND_NAME} @fatand -module antinuker`,
               `${COMMAND_NAME} @Administrador -module antiflood`,
               `${COMMAND_NAME} #galeria -module antilinks`,
            ],
            type: 'Bot Config',
         },
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }
   onBeforeRun(context: Command.Context, args: param) {
      return !!args.userOrRoleOrChannel.length;
   }

   onCancelRun(context: Command.Context, args: param) {
      return context.editOrReply('⚠ | Especifica el Usuario, Canal o Rol');
   }
   async run(context: Command.Context, args: param) {
      const { message } = context;

      const target =
         (message.mentions.first() as Structures.Member) ||
         (message.mentionRoles.first() as Structures.Role) ||
         (await getUserByText(context, args.userOrRoleOrChannel)) ||
         undefined ||
         (await getGuildChannel(context, args.userOrRoleOrChannel)) ||
         undefined ||
         (await getGuildRole(context, args.userOrRoleOrChannel)) ||
         undefined;
      if (!target) return context.editOrReply('⚠ | No pude identificar el objetivo')
      const isMember = target instanceof Structures.Member;
      const isChannel = target instanceof Structures.ChannelGuildBase;
      const isRole = target instanceof Structures.Role;
      const module = args.module;
      const document = (await Model.findOne({ ServerID: context.guildId }))!;

      switch (module.toLowerCase()) {
         case 'antinuke':
         case 'antinuker':
            if (isChannel)
               return context.editOrReply(
                  '⚠ | El tipo `Canal` no se puede establecer o remover en el sistema Antinuke'
               );
            if (isRole) {
               if (!document.Modules.AntiNuker.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol no se encuentra en la lista');
               document.Modules.AntiNuker.Whitelist.Roles = document.Modules.AntiNuker.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue removido de la whitelist del AntiNuke`
               );
            }
            if (isMember) {
               if (!document.Modules.AntiNuker.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario no se encuentra en la lista');
               document.Modules.AntiNuker.Whitelist.Users = document.Modules.AntiNuker.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue removido de la Whitelist del AntiNuke`
               );
            }
            break;
         case 'antiflood':
            if (isChannel) {
               if (!document.Modules.AntiFlood.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal no se encuentra en la lista');
               document.Modules.AntiFlood.Whitelist.Channels = document.Modules.AntiFlood.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue removido de la Whitelist del AntiFlood`
               );
            }
            if (isRole) {
               if (!document.Modules.AntiFlood.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol no se encuentra en la lista');
               document.Modules.AntiFlood.Whitelist.Roles = document.Modules.AntiFlood.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue removido de la whitelist del AntiFlood`
               );
            }
            if (isMember) {
               if (!document.Modules.AntiFlood.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario no se encuentra en la lista');
               document.Modules.AntiFlood.Whitelist.Users = document.Modules.AntiFlood.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue removido de la Whitelist del AntiFlood`
               );
            }
            break;
         case 'automod':
            if (isChannel) {
               if (!document.Modules.Automod.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal no se encuentra en la lista');
               document.Modules.Automod.Whitelist.Channels = document.Modules.Automod.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue removido de la Whitelist del Automod`
               );
            }
            if (isRole) {
               if (!document.Modules.Automod.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol no se encuentra en la lista');
               document.Modules.Automod.Whitelist.Roles = document.Modules.Automod.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue removido de la whitelist del Automod`
               );
            }
            if (isMember) {
               if (!document.Modules.Automod.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario no se encuentra en la lista');
               document.Modules.Automod.Whitelist.Users = document.Modules.Automod.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue removido de la Whitelist del Automod`
               );
            }
            break;
         case 'antiwalltext':
            if (isChannel) {
               if (!document.Modules.AntiWallText.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal no se encuentra en la lista');
               document.Modules.AntiWallText.Whitelist.Channels = document.Modules.AntiWallText.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue removido de la Whitelist del AntiWallText`
               );
            }
            if (isRole) {
               if (!document.Modules.AntiWallText.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol no se encuentra en la lista');
               document.Modules.AntiWallText.Whitelist.Roles = document.Modules.AntiWallText.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue removido de la whitelist del AntiWallText`
               );
            }
            if (isMember) {
               if (!document.Modules.AntiWallText.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario no se encuentra en la lista');
               document.Modules.AntiWallText.Whitelist.Users = document.Modules.AntiWallText.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue removido de la Whitelist del AntiWallText`
               );
            }
            break;
         case 'anticaps':
            if (isChannel) {
               if (!document.Modules.AntiCaps.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal no se encuentra en la lista');
               document.Modules.AntiCaps.Whitelist.Channels = document.Modules.AntiCaps.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue removido de la Whitelist del AntiCaps`
               );
            }
            if (isRole) {
               if (!document.Modules.AntiCaps.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol no se encuentra en la lista');
               document.Modules.AntiCaps.Whitelist.Roles = document.Modules.AntiCaps.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue removido de la whitelist del AntiCaps`
               );
            }
            if (isMember) {
               if (!document.Modules.AntiCaps.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario no se encuentra en la lista');
               document.Modules.AntiCaps.Whitelist.Users = document.Modules.AntiCaps.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue removido de la Whitelist del AntiCaps`
               );
            }
            break;
         case 'antilinks':
            if (isChannel) {
               if (!document.Modules.AntiLinks.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal no se encuentra en la lista');
               document.Modules.AntiLinks.Whitelist.Channels = document.Modules.AntiLinks.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue removido de la Whitelist del AntiLinks`
               );
            }
            if (isRole) {
               if (!document.Modules.AntiLinks.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol no se encuentra en la lista');
               document.Modules.AntiLinks.Whitelist.Roles = document.Modules.AntiLinks.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue removido de la whitelist del AntiLinks`
               );
            }
            if (isMember) {
               if (!document.Modules.AntiLinks.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario no se encuentra en la lista');
               document.Modules.AntiLinks.Whitelist.Users = document.Modules.AntiLinks.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue removido de la Whitelist del AntiLinks`
               );
            }
            break;
         case "all":
            if (isChannel) {
               let finalModels: string[] = [];
               if (document.Modules.Automod.Whitelist.Channels.includes(target.id)) {
                  document.Modules.Automod.Whitelist.Channels = document.Modules.Automod.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('Automod')
               }
               if (document.Modules.AntiWallText.Whitelist.Channels.includes(target.id)) {
                  document.Modules.AntiWallText.Whitelist.Channels = document.Modules.AntiWallText.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiWallText')
               }
               if (document.Modules.AntiFlood.Whitelist.Channels.includes(target.id)) {
                  document.Modules.AntiFlood.Whitelist.Channels = document.Modules.AntiFlood.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiFlood')
               }
               if (document.Modules.AntiCaps.Whitelist.Channels.includes(target.id)) {
                  document.Modules.AntiCaps.Whitelist.Channels = document.Modules.AntiCaps.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiCaps')
               }
               if (document.Modules.AntiLinks.Whitelist.Channels.includes(target.id)) {
                  document.Modules.AntiLinks.Whitelist.Channels = document.Modules.AntiLinks.Whitelist.Channels.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiLinks')
               }
               if (!finalModels.length) return context.editOrReply('ℹ️ | El Canal no se encuentra en ninguna Whitelist')
               await document.save()
               return context.editOrReply(`El Canal \`${target.name}\` fue removido de la Whitelist de: \`${finalModels.join(', ')}\``)
            }
            if (isRole) {
               let finalModels: string[] = [];
               if (document.Modules.AntiNuker.Whitelist.Roles.includes(target.id)) {
                  document.Modules.AntiNuker.Whitelist.Roles = document.Modules.AntiNuker.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiNuke')
               }
               if (document.Modules.Automod.Whitelist.Roles.includes(target.id)) {
                  document.Modules.Automod.Whitelist.Roles = document.Modules.Automod.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('Automod')
               }
               if (document.Modules.AntiWallText.Whitelist.Roles.includes(target.id)) {
                  document.Modules.AntiWallText.Whitelist.Roles = document.Modules.AntiWallText.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiWallText')
               }
               if (document.Modules.AntiFlood.Whitelist.Roles.includes(target.id)) {
                  document.Modules.AntiFlood.Whitelist.Roles = document.Modules.AntiFlood.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiFlood')
               }
               if (document.Modules.AntiCaps.Whitelist.Roles.includes(target.id)) {
                  document.Modules.AntiCaps.Whitelist.Roles = document.Modules.AntiCaps.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiCaps')
               }
               if (document.Modules.AntiLinks.Whitelist.Roles.includes(target.id)) {
                  document.Modules.AntiLinks.Whitelist.Roles = document.Modules.AntiLinks.Whitelist.Roles.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiLinks')
               }
               if (!finalModels.length) return context.editOrReply('ℹ️ | El Rol no se encuentra en ninguna Whitelist')
               await document.save()
               return context.editOrReply(`El Rol \`${target.name}\` fue removido de la Whitelist de: \`${finalModels.join(', ')}\``)
            }
            if (isMember) {
               let finalModels: string[] = [];
               if (document.Modules.AntiNuker.Whitelist.Users.includes(target.id)) {
                  document.Modules.AntiNuker.Whitelist.Users = document.Modules.AntiNuker.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiNuke')
               }
               if (document.Modules.Automod.Whitelist.Users.includes(target.id)) {
                  document.Modules.Automod.Whitelist.Users = document.Modules.Automod.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('Automod')
               }
               if (document.Modules.AntiWallText.Whitelist.Users.includes(target.id)) {
                  document.Modules.AntiWallText.Whitelist.Users = document.Modules.AntiWallText.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiWallText')
               }
               if (document.Modules.AntiFlood.Whitelist.Users.includes(target.id)) {
                  document.Modules.AntiFlood.Whitelist.Users = document.Modules.AntiFlood.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiFlood')
               }
               if (document.Modules.AntiCaps.Whitelist.Users.includes(target.id)) {
                  document.Modules.AntiCaps.Whitelist.Users = document.Modules.AntiCaps.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiCaps')
               }
               if (document.Modules.AntiLinks.Whitelist.Users.includes(target.id)) {
                  document.Modules.AntiLinks.Whitelist.Users = document.Modules.AntiLinks.Whitelist.Users.filter((arrItem: string) => arrItem !== target.id)
                  finalModels.push('AntiLinks')
               }
               if (!finalModels.length) return context.editOrReply('ℹ️ | El Miembro no se encuentra en ninguna whitelist')
               await document.save()
               return context.editOrReply(`El Miembro \`${target.user.tag}\` fue removido de la Whitelist de: \`${finalModels.join(', ')}\``)
            }
            break;
         default:
            return context.editOrReply('⚠ | Especifica un modulo valido');
            break;
      }
   }
   onSuccess(context: Command.Context){
      CacheCollection.loadData(context.guildId!)
   }
}