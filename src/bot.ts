import config from '../config.json'
import { InteractionCommandClient } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import mongoose from 'mongoose';
import Client from './client';
import 'reflect-metadata';
import CacheCollection from './cache/CacheCollection';
import './cache/index';
import { ShardBotCommandClient } from './commandClient';


(async () => {

  await mongoose.connect(config.mongoURL)
    .then(() => console.log("ShardDB Conectado"))
    .catch(console.error)

  Client.on(ClientEvents.GATEWAY_READY, () => CacheCollection.loadAll())

  Client.on(ClientEvents.REST_RESPONSE, async ({ response }) => {
    const { route } = response.request;

    if (route) {
      if (response.ok) {
        console.log(`(OK) ${response.statusCode} ${response.request.method}-${response.request.url} (${route.path})`);
      } else {
        const message = `(NOT OK) ${response.statusCode} ${response.request.method}-${response.request.url} (${route.path})`;
        console.log(message);
      }
    }
  });

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

})();