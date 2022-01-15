import { GatewayClientEvents } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';

import { BotModules } from '../utils/constants';
import { Model } from '../schemas/serverconfig';
import CacheCollection, { cacheClass } from './CacheCollection';

export class guildMemberRemove extends cacheClass {
   constructor() {
      super();
      this.client.on(
         ClientEvents.GUILD_MEMBER_REMOVE,
         async (payload: GatewayClientEvents.GuildMemberRemove) => {
            const data = CacheCollection.get(payload.guildId);
            if (!data) return;
            if (data.Users.Trusted.includes(payload.userId)) {
               const newData = await Model.findOneAndUpdate(
                  { ServerID: payload.guildId },
                  {
                     $pull: { [`Users.Trusted`]: payload.userId },
                  },
                  { new: true })
               CacheCollection.set(payload.guildId, newData);
            }

            for (const _module of BotModules) {
               const inWhitelist = this.checkWhitelist(
                  payload.guildId,
                  payload.userId,
                  _module,
                  'Users',
                  data
               );
               if (inWhitelist) {
                  const newData = await Model.findOneAndUpdate(
                     { ServerID: payload.guildId },
                     {
                        $pull: { [`Modules.${_module}.Whitelist.Users`]: payload.userId },
                     },
                     { new: true })
                  CacheCollection.set(payload.guildId, newData);
               }
            }

         }
      );
   }
}
export default new guildMemberRemove();
