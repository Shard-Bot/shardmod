import { GatewayClientEvents } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import { Model } from '../schemas/serverconfig'
import CacheCollection, { cacheClass } from './CacheCollection';

export class guildDelete extends cacheClass {
	constructor() {
		super()
		this.client.on(ClientEvents.GUILD_DELETE, async (payload: GatewayClientEvents.GuildDelete) => {
			await Model.findOneAndDelete({ ServerID: payload.guildId })
			CacheCollection.delete(payload.guildId)
		})
	}
}
export default new guildDelete();