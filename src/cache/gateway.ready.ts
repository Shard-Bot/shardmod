import { ShardClient, GatewayClientEvents } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import CacheCollection, { cacheClass } from '../cache/CacheCollection';

import Client from '../client';

export class gatewayReady extends cacheClass {
	constructor(client: ShardClient) {
		super(client);
		client.on(ClientEvents.GATEWAY_READY, ({ raw }: GatewayClientEvents.GatewayReady) => {
			CacheCollection.loadAll();
		});
	}
}
export default new gatewayReady(Client);
