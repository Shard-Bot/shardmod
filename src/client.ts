import { InteractionCommandClient, CommandClient, ShardClient } from 'detritus-client';
import { ClientEvents, PresenceStatuses } from 'detritus-client/lib/constants';
import config from '../config.json';

export default new ShardClient(config.token, {
  cache: { messages: { expire: 60 * 60 * 1000 } },
  gateway: {
    compress: false,
    intents: 'ALL',
    presence: {
      status: PresenceStatuses.ONLINE,
    },
  },
});
