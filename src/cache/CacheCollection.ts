import { Collections, ShardClient } from 'detritus-client';
import mongoose from 'mongoose';

import { Model } from '../schemas/serverconfig';
import Client from '../client';
import { ClientEvents } from 'detritus-client/lib/constants';
import { ServerConfig } from '../utils/types';
import { createData } from '../utils/functions';

export class cacheClass extends Collections.BaseCollection<any, ServerConfig> {
	client: ShardClient;
	constructor(client: ShardClient) {
		super();
		this.client = client;
		this.client.on(ClientEvents.GATEWAY_READY, () => this.loadAll())
	}
	async loadAll() {
		console.log('Cargando Cache');

		const { guilds } = this.client
		const start = Date.now();
		const data = await Model.find().lean();

		for (const config of data) {
			this.set(config.ServerID, config);
		}

		const guildsWithoutData = guilds
			.filter(guild => !data.map(config => config.ServerID).includes(guild.id))

		for (const { id, name } of guildsWithoutData) {
			console.log(`Creando data en ${name} [${id}]`)
			const config = await createData(id)
			this.set(id, config)
		}

		console.log(`Cache Cargada (${this.size}/${this.client.guilds.size} Servidores) en ${Date.now() - start}`);
	}
}

export default new cacheClass(Client);
