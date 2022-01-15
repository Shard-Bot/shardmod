import { GatewayClientEvents } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';

import { createData } from '../utils/functions';
import CacheCollection, { cacheClass } from './CacheCollection';

export class guildCreate extends cacheClass {
	constructor() {
		super()
		this.client.on(ClientEvents.GUILD_CREATE, async (payload: GatewayClientEvents.GuildCreate) => {
			if (payload.fromUnavailable) return;
			const config = await createData(payload.guild.id)
			CacheCollection.set(payload.guild.id, config)
		})
	}
}
export default new guildCreate();