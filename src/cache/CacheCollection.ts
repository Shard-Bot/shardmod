import { Collections } from 'detritus-client';

import { Model } from '../schemas/serverconfig';
import Client from '../client';
import { ServerConfig } from '../utils/types';
import { createData } from '../utils/functions';
import { autoInjectable, container } from 'tsyringe';

@autoInjectable()
export class cacheClass extends Collections.BaseCollection<string, ServerConfig> {
	client = Client;
	async loadAll() {
		console.log('Cargando Cache');

		const { guilds } = this.client
		const start = Date.now();
		const data = await Model.find().lean();

		for (const config of data.filter((c) => guilds.map(g => g.id).includes(c.ServerID))) {
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
	checkWhitelist(guildId: string, targetId: string, _module: string, _moduleType: string, document: ServerConfig) {
        return (document as any).Modules[_module].Whitelist[_moduleType].includes(targetId)
	}
}

export default container.resolve(cacheClass);
