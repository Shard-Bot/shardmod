import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed, intToHex } from 'detritus-client/lib/utils';
import { getUserByText } from '../../../utils/functions';
import mongoose from 'mongoose';
import { Model } from '../../../schemas/serverconfig';
export const COMMAND_NAME = 'trusted remove';
type param = {
   user: string;
};

export default class TrustedRemoveCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['t remove', 't del', 'trusted del', 't rm'],
         disableDm: true,
         label: 'user',
         metadata: {
            description: 'Remueve a un Usuario de la lista trusted del servidor',
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
      if (!document.Users.Trusted.includes(target.id))
         return context.editOrReply('ℹ️ | El Miembro no se encuentra en la lista');
      document.Users.Trusted = document.Users.Trusted.filter(
         (arrItem: string) => arrItem !== target.id
      );
      await document.save();
      return context.editOrReply(
         `El Miembro ${target.user.tag} fue removido de la lista trusted del servidor`
      );
   }
}
