import { Command, Interaction, Structures, Utils, GatewayClientEvents } from 'detritus-client';
import {
   InteractionCallbackTypes,
   MessageComponentButtonStyles,
} from 'detritus-client/lib/constants';
import { Components, ComponentContext, Embed } from 'detritus-client/lib/utils';
import { ClientEvents, MessageFlags } from 'detritus-client/lib/constants';
import { DiscordEmojis } from './constants';

export async function paginate(
   context: Command.Context,
   targets: Array<string>,
   pageLength: number,
   timeout: number,
   embeds: Array<Embed>
) {
   let page = 0;
   const components = new Components({
      timeout: timeout,
   });
   let previous = await components.createButton({
      customId: 'previous',
      disabled: page === 0,
      emoji: DiscordEmojis.PREVIOUS,
   });
   let next = await components.createButton({
      customId: 'next',
      disabled: page === pageLength,
      emoji: DiscordEmojis.NEXT,
   });

   let cancel = await components.createButton({
      customId: 'cancel',
      style: MessageComponentButtonStyles.DANGER,
      emoji: DiscordEmojis.CANCEL,
   });
   let mainEmbed = await context.editOrReply({
      components: components,
      embeds: [embeds[page]],
   });

   const subscription = context.client.subscribe(
      ClientEvents.INTERACTION_CREATE,
      async (payload: GatewayClientEvents.InteractionCreate) => {
        if(!payload.interaction.isFromMessageComponent) return;
        if(payload.interaction.message?.id !== mainEmbed.id) return;
         if (!targets.includes(payload.interaction.userId))
            return payload.interaction.editOrRespond({
               content: 'Esta no es tu interacción',
               flags: MessageFlags.EPHEMERAL,
            });
         const interactionData = payload.interaction.data as Structures.InteractionDataComponent;
         if (interactionData.customId === 'next') {
            await page++;
            if (page !== 0 && previous.disabled) previous.setDisabled(false);
            if (page === embeds.length - 1) next.setDisabled(true);
            await mainEmbed.edit({
               components: components,
               embeds: [embeds[page]],
            });
            return await payload.interaction.respond(
               InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE
            );
         }
         if (interactionData.customId === 'previous') {
            await page--;
            if (page !== embeds.length && next.disabled) next.setDisabled(false);
            if (page === 0) previous.setDisabled(true);
            await mainEmbed.edit({
               components: components,
               embeds: [embeds[page]],
            });
            return await payload.interaction.respond(
               InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE
            );
         }
         if (interactionData.customId === 'cancel') {
            await mainEmbed.edit({
               components: [],
            });
         }
      }
   );

   setTimeout(async function () {
      subscription.remove();
      if (!mainEmbed.deleted && mainEmbed.components.length) {
         await mainEmbed.edit({
            components: [],
         });
      }
   }, timeout);
}
