import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { getUserByText } from '../../../utils/functions';
import { Model } from '../../../schemas/serverconfig';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'trusted add';
type param = {
   user: string;
};

export default class TrustedAddCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['t add'],
         disableDm: true,
         label: 'user',
         metadata: {
            guildOwnerOnly: true,
            description: 'Agrega a un Usuario a la lista trusted del servidor',
            usage: [`${COMMAND_NAME} <Miembro>`],
            example: [`${COMMAND_NAME} @fatand`],
            type: 'Bot Config',
         },
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }
   onBeforeRun(context: Command.Context, args: param) {
      return !!args.user.length;
   }

   onCancelRun(context: Command.Context, args: param) {
      return context.editOrReply('⚠ | Especifica el Miembro');
   }
   async run(context: Command.Context, args: param) {
      const { message } = context;

      const target =
         (message.mentions.first() as Structures.Member) ||
         (await getUserByText(context, args.user));
      const isMember = target instanceof Structures.Member;
      if (!target || !isMember) return context.editOrReply('⚠ | No pude encontrar el Miembro');
      const document = (await Model.findOne({ ServerID: context.guildId }))!;
      if (document.Users.Trusted.includes(target.id))
         return context.editOrReply('ℹ️ | El Usuario ya se encuentra en la lista');

      document.Users.Trusted.push(target.id);
      await document.save();
      return context.editOrReply(
         `El Miembro ${target.user.tag} fue añadido a la lista trusted del servidor`
      );
   }
}
