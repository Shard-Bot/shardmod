import config from '../config.json'
import { InteractionCommandClient, CommandClient, ShardClient, ClusterClient } from 'detritus-client';
import { EventSubscription } from 'detritus-utils';

import * as Sentry from '@sentry/node';
import { ActivityTypes, ClientEvents, PresenceStatuses, SocketStates } from 'detritus-client/lib/constants';

  Sentry.init({
    dsn: config.sentry_dns,
  });


const Client = new ShardClient(config.token, {
  cache: {messages: {expire: 60 * 60 * 1000}}, // messages expire after 1 hour
  gateway: {
    compress: false,
    intents: 'ALL',
    presence: {
      status: PresenceStatuses.ONLINE,
    },
  },
});
(async () => {


  Client.on(ClientEvents.REST_RESPONSE, async ({response, restRequest}) => {
    const route = response.request.route;

    if (route) {
      if (response.ok) {
        console.log(`(OK) ${response.statusCode} ${response.request.method}-${response.request.url} (${route.path})`);
      } else {
        const message = `(NOT OK) ${response.statusCode} ${response.request.method}-${response.request.url} (${route.path})`;
        console.log(message);
        console.log(await response.text());
        Sentry.captureException(new Error(message));
      }
    }
  });

  Client.on(ClientEvents.WARN, ({error}) => {
    Sentry.captureException(error);
  });


  try {
    await Client.run();
    console.log('cluster ran', Client.ran);
    const shardsText = `Shards #(${Client.shardCount})`;
    console.log(`${shardsText} - Loaded`);

    {
      const shardCommandBot = new CommandClient(Client, {
        activateOnEdits: true,
        mentionsEnabled: true,
        prefix: 's!',
        ratelimits: [
          {duration: 60000, limit: 50, type: 'guild'},
          {duration: 5000, limit: 5, type: 'channel'},
        ],
      });

      shardCommandBot.on(ClientEvents.COMMAND_RAN, async ({command, context}) => {
        // log 
      });

      shardCommandBot.on(ClientEvents.COMMAND_RUN_ERROR, async ({command, context}) => {
        // log 
      });

      await shardCommandBot.addMultipleIn('./commands/prefix');
      await shardCommandBot.run();
      console.log(`${shardsText} - Command Client Loaded`);
    }

    {
      const shardInteractionBot = new InteractionCommandClient(Client);
      await shardInteractionBot.addMultipleIn('./commands/interactions');
      await shardInteractionBot.run();
      console.log(`${shardsText} - Interaction Command Client Loaded`);
    }
  } catch(error: any) {
    console.log(error);
    console.log(error.errors);
  }
})();