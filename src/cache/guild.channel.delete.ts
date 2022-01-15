import { GatewayClientEvents } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';

import { BotModules, BotLogs } from '../utils/constants';
import { Model } from '../schemas/serverconfig';
import CacheCollection, { cacheClass } from './CacheCollection';

export class guildChannelDelete extends cacheClass {
   constructor() {
      super();
      this.client.on(
         ClientEvents.CHANNEL_DELETE,
         async (payload: GatewayClientEvents.ChannelDelete) => {
            if (!payload.channel.isGuildChannel) return;
            const data = CacheCollection.get(payload.channel.guildId);
            if (!data) return;
            for (const _module of BotLogs) {
               const exists = data.Channels[_module] === payload.channel.id;
               if (exists) {
                  const newData = await Model.findOneAndUpdate(
                     { ServerID: payload.channel.guildId },
                     {
                        $set: { [`Channels.${_module}`]: "" },
                     },
                     { new: true })
                  CacheCollection.set(payload.channel.guildId, newData);
               }
            }

            for (const _module of BotModules) {
               if (_module !== 'AntiNuker') {
                  const inWhitelist = this.checkWhitelist(
                     payload.channel.guildId,
                     payload.channel.id,
                     _module,
                     'Channels',
                     data
                  );
                  if (inWhitelist) {
                     const newData = await Model.findOneAndUpdate(
                        { ServerID: payload.channel.guildId },
                        {
                           $pull: { [`Modules.${_module}.Whitelist.Channels`]: payload.channel.id },
                        },
                        { new: true })
                     CacheCollection.set(payload.channel.guildId, newData);
                  }
               }
            }
         }
      );
   }
}
export default new guildChannelDelete();