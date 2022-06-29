import config from '../config.json';
import { InteractionCommandClient } from 'detritus-client';
import mongoose from 'mongoose';
import Client from './client';
import 'reflect-metadata';
import './cache/index';
import { ShardBotCommandClient } from './commandClient';
import './systems/index';
import { ClientEvents } from 'detritus-client/lib/constants';

(async () => {
	await mongoose
		.connect(config.mongoURL)
		.then(() => console.log('ShardDB Conectado'))
		.catch(console.error);

	// Client.on(ClientEvents.GATEWAY_READY, () => CacheCollection.loadAll());

	// Client.on(ClientEvents.REST_RESPONSE, async ({ response }) => {
	//   const { route } = response.request;

	//   if (route) {
	//     if (response.ok) {
	//       console.log(`(OK) ${response.statusCode} ${response.request.method}-${response.request.url} (${route.path})`);
	//     } else {
	//       const message = `(NOT OK) ${response.statusCode} ${response.request.method}-${response.request.url} (${route.path})`;
	//       console.log(message);
	//     }
	//   }
	// });
	Client.on(ClientEvents.GUILD_CREATE, ({guild, fromUnavailable}) => {
		if (fromUnavailable) return;
		Client.channels.get('939615582846869514')?.createMessage(`Guild Create\nGuild: ${guild.name} • ${guild.id}\nOwner: ${guild.owner.tag} • ${guild.ownerId}\nMembercount: ${guild.memberCount}\nFecha: <t:${Math.round(Date.now() / 1000)}:R>`)
	})
	Client.on(ClientEvents.GUILD_DELETE, ({guild}) => {
		Client.channels.get('939615626220154911')?.createMessage(`Guild Delete\nGuild: ${guild.name} • ${guild.id}\nOwner: ${guild.owner.tag} • ${guild.ownerId}\nMembercount: ${guild.memberCount}\nFecha: <t:${Math.round(Date.now() / 1000)}:R>`)
	})
	await Client.run();

	{
		const shardCommandBot = new ShardBotCommandClient();

		await shardCommandBot.addMultipleIn('./commands/prefix');
		await shardCommandBot.run();
		console.log(`Comandos [s!] cargados.`);
	}

	{
		const shardInteractionBot = new InteractionCommandClient(Client);
		await shardInteractionBot.addMultipleIn('./commands/interactions');
		await shardInteractionBot.run();
		console.log(`Comandos [/] cargados.`);
	}
	process.on('unhandledRejection', (rej) => console.log(rej));
})();
