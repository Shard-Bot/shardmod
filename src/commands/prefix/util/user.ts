import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed, intToHex } from 'detritus-client/lib/utils';
import { DiscordEmojis, EmbedColors, PERMISSIONS, PermissionsText } from '../../../utils/constants';
import {
   getUserByText,
   fetchUserById,
   getMemberJoinPosition,
   permissionsToObject,
} from '../../../utils/functions';

export const COMMAND_NAME = 'user';
type param = {
   user: string;
};

export default class MemberCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         label: 'user',
         metadata: {
            description: 'Obtiene informacion de un usuario o miembro',
            usage: [COMMAND_NAME],
            type: 'INFO',
         },
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }
   async run(context: Command.Context, args: param) {
      let { guild, message } = context;

      let User =
         (message.mentions.first() as Structures.Member) || (args.user
            ? await getUserByText(context, args.user)
            : undefined) || context.member || context.user;
      if (!User) return context.editOrReply('⚠ | No pude encontrar el usuario');
      const isMember = User instanceof Structures.Member;
      const member = User as Structures.Member;
      const isBooster = member.premiumSinceUnix ? true : false;
      const user = (isMember ? member.user : User) as Structures.User;
      const userWithBanner =
         User instanceof Structures.UserWithBanner ? User : await context.rest.fetchUser(user.id);

      const embed = new Embed();

      const badges: string[] = [];

      for (let item in DiscordEmojis.DISCORD_BADGES) {
         if (user.hasFlag(parseInt(item))) {
            badges.push((DiscordEmojis.DISCORD_BADGES as any)[item]);
         }
      }
      if (user.avatar?.startsWith('a_') || userWithBanner.banner) {
         badges.push(DiscordEmojis.NITRO as any);
      }
      let banner = userWithBanner.bannerUrlFormat(null, { size: 1024 });

      embed.setAuthor(user.toString(), user.avatarUrlFormat(null, { size: 1024 }), user.jumpLink);

      embed.setDescription(user.mention);

      embed.setThumbnail(member.avatarUrlFormat(null, { size: 1024 }));

      embed.setColor(userWithBanner.accentColor || EmbedColors.MAIN);

      if (banner) embed.setImage(banner);

      embed.addField(
         '**Información**',
         `
    **Tag:** ${user.tag}
    **Id:** \`${user.id}\`
    **Bot?:** ${user.bot ? 'Si' : 'No'}
    **Creación:** <t:${Math.round(user.createdAtUnix / 1000)}:R>
    **Insignias:** ${badges.length ? badges.join(' ') : 'Sin Insignias'}
    **AccentColor:** ${
       userWithBanner.accentColor ? intToHex(userWithBanner.accentColor) : 'Sin color'
    }
    `,
         true
      );

      if (isMember) {
         let JoinPosition = guild
            ? `${getMemberJoinPosition(guild, member.id)[0]}/${guild.memberCount}`
            : 'Sin Posición';
         //Informacion de Miembro
         embed.addField(
            '**En Servidor**',
            `
    **Unión:** <t:${Math.round(member.joinedAtUnix / 1000)}:R>
    **Booster?:** ${isBooster ? 'Si' : 'No'}
    **Apodo?:** ${member.nick ? member.nick : 'Sin Apodo'}
    **JoinPosition:** ${JoinPosition}
    `,
            true
         );

         const roles = member.roles
            .map((role, roleId) => role || roleId)
            .sort((x: Structures.Role | string, y: Structures.Role | string) => {
               if (x instanceof Structures.Role && y instanceof Structures.Role) {
                  return y.position - x.position;
               }
               return 0;
            })
            .map((role: Structures.Role | string) => {
               if (role instanceof Structures.Role) {
                  if ((role.isDefault || context.guildId !== member.guildId) && role) {
                     return ` `;
                  }
                  return role.mention;
               }
               return `<@&${role}>`;
            });

         let rolesText = `${
            roles.length > 8
               ? `${roles.slice(0, 8).join(', ')} ${roles.length - 8}+`
               : roles.join(', ')
         }`;

         const permissions = permissionsToObject(member.permissions);

         const Perms: Array<string> = [];
         for (const permission of PERMISSIONS) {
            const key = String(permission);
            const can = permissions[key];
            if (can) Perms.push(`${PermissionsText[key]}`);
         }
         let permissionsText = `${
            Perms.length > 8
               ? `${Perms.slice(0, 8).join(', ')} ${Perms.length - 8}+`
               : Perms.join(', ')
         }`;

         //accesorios facheros
         embed.addField(
            '**Accesorios De Servidor**',
            `
    **Roles:** [${roles.length - 1}] ${rolesText}
    **Permisos:** [${Perms.length}] \`\`\`${permissionsText}\`\`\`
    `
         );
      } else {
        if(guild) embed.setFooter(`${user.name} No esta en este servidor!`)
      }

      return context.editOrReply({ embeds: [embed] });
   }
}
