import { Collections } from 'detritus-client';

import { Model } from '../schemas/serverconfig';
import Client from '../client';
import { ServerConfig } from '../utils/types';
import { createData } from '../utils/functions';
import { autoInjectable, container } from 'tsyringe';

@autoInjectable()
export class cacheClass extends Collections.BaseCollection<string, ServerConfig> {
	client = Client;

	async getOrFetch(key: string) {
		let data = this.get(key);

		data ??= await this.fetch(key);

		return data;
	}

	async fetch(key: string) {
		let data = await Model.findOne({ ServerID: key }).lean();

		data ??= await createData(key);

		return data;
	}

	checkWhitelist(
		guildId: string,
		targetId: string,
		_module: string,
		_moduleType: string,
		document: ServerConfig
	) {
		return (document as any).Modules[_module].Whitelist[_moduleType].includes(
			targetId
		);
	}
}

export default container.resolve(cacheClass);
