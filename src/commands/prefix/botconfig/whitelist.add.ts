import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed, intToHex } from 'detritus-client/lib/utils';
import { EmbedColors } from '../../../utils/constants';
import { getUserByText, getGuildChannel, getGuildRole } from '../../../utils/functions';
import mongoose from 'mongoose';
import { Model } from '../../../schemas/serverconfig';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'whitelist add';
type param = {
   userOrRoleOrChannel: string;
   module: string;
};

export default class WhitelistaddCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['wl add'],
         disableDm: true,
         args: [{ name: 'module', type: String, required: true, aliases: ['sistema'] }],
         label: 'userOrRoleOrChannel',
         metadata: {
            trustedOnly: true,
            description: 'Agrega a un Usuario|Canal|Rol a la whitelist de un modulo',
            usage: [`${COMMAND_NAME} <Miembro|Canal|Rol> <-module <sistema> >`],
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
      const isMember = target instanceof Structures.Member;
      const isChannel = target instanceof Structures.ChannelGuildBase;
      const isRole = target instanceof Structures.Role;
      const module = args.module;
      if (!target) return context.editOrReply('⚠ | No pude identificar el objetivo');
      const document = (await Model.findOne({ ServerID: context.guildId }))!;

      switch (module.toLowerCase()) {
         case 'antinuke':
         case 'antinuker':
            if (isChannel)
               return context.editOrReply(
                  '⚠ | El tipo `Canal` no se puede establecer en el sistema AntiNuke'
               );
            if (isRole) {
               if (document.Modules.AntiNuker.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol ya se encuentra en la lista');
               document.Modules.AntiNuker.Whitelist.Roles.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue añadido a la whitelist del AntiNuke`
               );
            }
            if (isMember) {
               if (document.Modules.AntiNuker.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario ya se encuentra en la lista');
               document.Modules.AntiNuker.Whitelist.Users.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue añadido a la Whitelist del AntiNuke`
               );
            }
            break;
         case 'antiflood':
            if (isChannel) {
               if (document.Modules.AntiFlood.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal ya se encuentra en la lista');
               document.Modules.AntiFlood.Whitelist.Channels.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue añadido a la Whitelist del AntiFlood`
               );
            }
            if (isRole) {
               if (document.Modules.AntiFlood.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol ya se encuentra en la lista');
               document.Modules.AntiFlood.Whitelist.Roles.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue añadido a la whitelist del AntiFlood`
               );
            }
            if (isMember) {
               if (document.Modules.AntiFlood.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario ya se encuentra en la lista');
               document.Modules.AntiFlood.Whitelist.Users.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue añadido a la Whitelist del AntiFlood`
               );
            }
            break;
         case 'automod':
            if (isChannel) {
               if (document.Modules.Automod.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal ya se encuentra en la lista');
               document.Modules.Automod.Whitelist.Channels.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue añadido a la Whitelist del Automod`
               );
            }
            if (isRole) {
               if (document.Modules.Automod.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol ya se encuentra en la lista');
               document.Modules.Automod.Whitelist.Roles.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue añadido a la whitelist del Automod`
               );
            }
            if (isMember) {
               if (document.Modules.Automod.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario ya se encuentra en la lista');
               document.Modules.Automod.Whitelist.Users.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue añadido a la Whitelist del Automod`
               );
            }
            break;
         case 'antiwalltext':
            if (isChannel) {
               if (document.Modules.AntiWallText.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal ya se encuentra en la lista');
               document.Modules.AntiWallText.Whitelist.Channels.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue añadido a la Whitelist del AntiWallText`
               );
            }
            if (isRole) {
               if (document.Modules.AntiWallText.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol ya se encuentra en la lista');
               document.Modules.AntiWallText.Whitelist.Roles.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue añadido a la whitelist del AntiWallText`
               );
            }
            if (isMember) {
               if (document.Modules.AntiWallText.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario ya se encuentra en la lista');
               document.Modules.AntiWallText.Whitelist.Users.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue añadido a la Whitelist del AntiWallText`
               );
            }
            break;
         case 'anticaps':
            if (isChannel) {
               if (document.Modules.AntiCaps.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal ya se encuentra en la lista');
               document.Modules.AntiCaps.Whitelist.Channels.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue añadido a la Whitelist del AntiCaps`
               );
            }
            if (isRole) {
               if (document.Modules.AntiCaps.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol ya se encuentra en la lista');
               document.Modules.AntiCaps.Whitelist.Roles.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue añadido a la whitelist del AntiCaps`
               );
            }
            if (isMember) {
               if (document.Modules.AntiCaps.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario ya se encuentra en la lista');
               document.Modules.AntiCaps.Whitelist.Users.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue añadido a la Whitelist del AntiCaps`
               );
            }
            break;
         case 'antilinks':
            if (isChannel) {
               if (document.Modules.AntiLinks.Whitelist.Channels.includes(target.id))
                  return context.editOrReply('ℹ️ | El Canal ya se encuentra en la lista');
               document.Modules.AntiLinks.Whitelist.Channels.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Canal ${target.name} fue añadido a la Whitelist del AntiLinks`
               );
            }
            if (isRole) {
               if (document.Modules.AntiLinks.Whitelist.Roles.includes(target.id))
                  return context.editOrReply('ℹ️ | El Rol ya se encuentra en la lista');
               document.Modules.AntiLinks.Whitelist.Roles.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El rol ${target.name} fue añadido a la whitelist del AntiLinks`
               );
            }
            if (isMember) {
               if (document.Modules.AntiLinks.Whitelist.Users.includes(target.id))
                  return context.editOrReply('ℹ️ | El Usuario ya se encuentra en la lista');
               document.Modules.AntiLinks.Whitelist.Users.push(target.id);
               await document.save();
               return context.editOrReply(
                  `El Miembro ${target.user.tag} fue añadido a la Whitelist del AntiLinks`
               );
            }
            break;
         case "all":
            if (isChannel) {
               let finalModels: string[] = [];
               if (!document.Modules.Automod.Whitelist.Channels.includes(target.id)) {
                  await document.Modules.Automod.Whitelist.Channels.push(target.id)
                  finalModels.push('Automod')
               }
               if (!document.Modules.AntiWallText.Whitelist.Channels.includes(target.id)) {
                  await document.Modules.AntiWallText.Whitelist.Channels.push(target.id)
                  finalModels.push('AntiWallText')
               }
               if (!document.Modules.AntiFlood.Whitelist.Channels.includes(target.id)) {
                  await document.Modules.AntiFlood.Whitelist.Channels.push(target.id)
                  finalModels.push('AntiFlood')
               }
               if (!document.Modules.AntiCaps.Whitelist.Channels.includes(target.id)) {
                  await document.Modules.AntiCaps.Whitelist.Channels.push(target.id)
                  finalModels.push('AntiCaps')
               }
               if (!document.Modules.AntiLinks.Whitelist.Channels.includes(target.id)) {
                  await document.Modules.AntiLinks.Whitelist.Channels.push(target.id)
                  finalModels.push('AntiLinks')
               }
               if (!finalModels.length) return context.editOrReply('ℹ️ | El Canal ya se encuentra en todas las Whitelists')
               await document.save()
               return context.editOrReply(`El Canal \`${target.name}\` fue añadido a la Whitelist de: \`${finalModels.join(', ')}\``)
            }
            if (isRole) {
               let finalModels: string[] = [];
               if (!document.Modules.AntiNuker.Whitelist.Roles.includes(target.id)) {
                  await document.Modules.AntiNuker.Whitelist.Roles.push(target.id)
                  finalModels.push('Antinuke')
               }
               if (!document.Modules.Automod.Whitelist.Roles.includes(target.id)) {
                  await document.Modules.Automod.Whitelist.Roles.push(target.id)
                  finalModels.push('Automod')
               }
               if (!document.Modules.AntiWallText.Whitelist.Roles.includes(target.id)) {
                  await document.Modules.AntiWallText.Whitelist.Roles.push(target.id)
                  finalModels.push('AntiWallText')
               }
               if (!document.Modules.AntiFlood.Whitelist.Roles.includes(target.id)) {
                  await document.Modules.AntiFlood.Whitelist.Roles.push(target.id)
                  finalModels.push('AntiFlood')
               }
               if (!document.Modules.AntiCaps.Whitelist.Roles.includes(target.id)) {
                  await document.Modules.AntiCaps.Whitelist.Roles.push(target.id)
                  finalModels.push('AntiCaps')
               }
               if (!document.Modules.AntiLinks.Whitelist.Roles.includes(target.id)) {
                  await document.Modules.AntiLinks.Whitelist.Roles.push(target.id)
                  finalModels.push('AntiLinks')
               }
               if (!finalModels.length) return context.editOrReply('ℹ️ | El Rol ya se encuentra en todas las Whitelists')
               await document.save()
               return context.editOrReply(`El Rol \`${target.name}\` fue añadido a la Whitelist de: \`${finalModels.join(', ')}\``)
            }
            if (isMember) {
               let finalModels: string[] = [];
               if (!document.Modules.AntiNuker.Whitelist.Users.includes(target.id)) {
                  await document.Modules.AntiNuker.Whitelist.Users.push(target.id)
                  finalModels.push('AntiNuke')
               }
               if (!document.Modules.Automod.Whitelist.Users.includes(target.id)) {
                  await document.Modules.Automod.Whitelist.Users.push(target.id)
                  finalModels.push('Automod')
               }
               if (!document.Modules.AntiWallText.Whitelist.Users.includes(target.id)) {
                  await document.Modules.AntiWallText.Whitelist.Users.push(target.id)
                  finalModels.push('AntiWallText')
               }
               if (!document.Modules.AntiFlood.Whitelist.Users.includes(target.id)) {
                  await document.Modules.AntiFlood.Whitelist.Users.push(target.id)
                  finalModels.push('AntiFlood')
               }
               if (!document.Modules.AntiCaps.Whitelist.Users.includes(target.id)) {
                  await document.Modules.AntiCaps.Whitelist.Users.push(target.id)
                  finalModels.push('AntiCaps')
               }
               if (!document.Modules.AntiLinks.Whitelist.Users.includes(target.id)) {
                  await document.Modules.AntiLinks.Whitelist.Users.push(target.id)
                  finalModels.push('AntiLinks')
               }
               if (!finalModels.length) return context.editOrReply('ℹ️ | El Miembro ya se encuentra en todas las Whitelists')
               await document.save()
               return context.editOrReply(`El Miembro \`${target.user.tag}\` fue añadido a la Whitelist de: \`${finalModels.join(', ')}\``)
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
