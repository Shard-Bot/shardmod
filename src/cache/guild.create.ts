import { GatewayClientEvents } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';

import { createData } from '../utils/functions';
import CacheCollection from './CacheCollection';
import Client from '../client';

export default Client.on(ClientEvents.GUILD_CREATE, async (payload: GatewayClientEvents.GuildCreate) => {
	if (payload.fromUnavailable) return;
	const config = await createData(payload.guild.id)
	CacheCollection.set(payload.guild.id, config)
})
