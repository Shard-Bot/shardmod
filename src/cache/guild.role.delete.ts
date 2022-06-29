import { GatewayClientEvents } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';

import { BotModules } from '../utils/constants';
import { Model } from '../schemas/serverconfig';
import CacheCollection from './CacheCollection';
import Client from '../client';

export default Client.on(
	ClientEvents.GUILD_ROLE_DELETE,
	async (payload: GatewayClientEvents.GuildRoleDelete) => {
		const data = await CacheCollection.getOrFetch(payload.guildId);
		if (!data) return;
		if (data.Roles.MuteRol.length) {
			const newData = await Model.findOneAndUpdate(
				{ ServerID: payload.guildId },
				{
					$set: { ['Roles.MuteRol']: '' },
				},
				{ new: true }
			);
			CacheCollection.set(payload.guildId, newData);
		}

		for (const _module of BotModules) {
			const inWhitelist = CacheCollection.checkWhitelist(
				payload.guildId,
				payload.roleId,
				_module,
				'Roles',
				data
			);
			if (inWhitelist) {
				const newData = await Model.findOneAndUpdate(
					{ ServerID: payload.guildId },
					{
						$pull: { [`Modules.${_module}.Whitelist.Roles`]: payload.roleId },
					},
					{ new: true }
				);
				CacheCollection.set(payload.guildId, newData);
			}
		}
	}
);
