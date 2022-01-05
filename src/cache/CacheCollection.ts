import { Collections, ShardClient } from 'detritus-client';
import mongoose from 'mongoose';

import { Model } from '../schemas/serverconfig';
import Client from '../client';

export class cacheClass extends Collections.BaseCollection<any, any> {
	client: ShardClient;
	constructor(client: ShardClient) {
		super();
		this.client = client;
	}
	async loadAll() {
		console.log('Cargando Cache');
		const cursor = Model.find().cursor();
		for (let server = await cursor.next(); server != null; server = await cursor.next()) {
			this.set(server.ServerID, server);
		}
		console.log(`Cache Cargada (${this.size}/${this.client.guilds.size} Servidores)`);
	}
}
export default new cacheClass(Client);
