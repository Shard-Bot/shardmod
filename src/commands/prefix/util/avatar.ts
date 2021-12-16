import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed, intToHex } from 'detritus-client/lib/utils';
import { EmbedColors } from '../../../utils/constants';
import { getUserByText, fetchUserById } from '../../../utils/functions';

export const COMMAND_NAME = 'avatar';
type param = {
   user: string;
};

export default class AvatarCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['pfp', 'usericon', 'av'],
         label: 'user',
         metadata: {
            description: 'Obtiene el avatar de un usuario o miembro',
            usage: [COMMAND_NAME, `${COMMAND_NAME} @fatand`],
            type: 'INFO',
         },
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }
   async run(context: Command.Context, args: param) {
      let { guild, message } = context;

      let User =
         (message.mentions.first() as Structures.Member) ||
         (args.user ? await getUserByText(context, args.user) : undefined) ||
         context.member ||
         context.user;
      if (!User) return context.editOrReply('⚠ | No pude encontrar el usuario');
      const isMember = User instanceof Structures.Member;
      const userWithBanner =
         User instanceof Structures.UserWithBanner ? User : await context.rest.fetchUser(User.id);
      let embed = new Embed();
      embed.setColor(userWithBanner.accentColor || EmbedColors.MAIN);
      let URLS = [];
      URLS.push({ name: 'Defecto', URL: User.defaultAvatarUrl });
      if (isMember) {
         embed.setImage(User.avatarUrlFormat(null, { size: 1024 }));
         URLS.push({ name: 'Servidor', URL: User.avatarUrlFormat(null, { size: 4096 }) });
         if (User.avatarUrl !== User.user.avatarUrl) {
            embed.setThumbnail(User.user.avatarUrlFormat(null, { size: 1024 }));
            URLS.push({ name: 'Usuario', URL: User.avatarUrlFormat(null, { size: 4096 }) });
         }
      } else {
         embed.setImage(User.avatarUrlFormat(null, { size: 1024 }));
         URLS.push({ name: 'Usuario', URL: User.avatarUrlFormat(null, { size: 4096 }) });
      }
      if (URLS.length) {
         embed.setDescription(
            `**Full URLS: ${URLS.map((item) => `[${item.name}](${item.URL})`).join(', ')}**`
         );
      }

      return context.editOrReply({ embeds: [embed] });
   }
}
