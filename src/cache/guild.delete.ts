import { GatewayClientEvents } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import { Model } from '../schemas/serverconfig'
import CacheCollection from './CacheCollection';
import Client from '../client';

export default Client.on(ClientEvents.GUILD_DELETE, async (payload: GatewayClientEvents.GuildDelete) => {
	await Model.findOneAndDelete({ ServerID: payload.guildId })
	CacheCollection.delete(payload.guildId)
})
