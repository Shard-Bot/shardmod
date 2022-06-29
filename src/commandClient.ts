import { CommandClient } from 'detritus-client';
import { Context, Command } from 'detritus-client/lib/command';
import ShardClient from './client';
import CacheCollection from './cache/CacheCollection';

export class ShardBotCommandClient extends CommandClient {
	constructor() {
		super(ShardClient, {
			activateOnEdits: true,
			mentionsEnabled: true,
			prefix: 's.',
			ratelimits: [
				{ duration: 60000, limit: 50, type: 'guild' },
				{ duration: 5000, limit: 5, type: 'channel' },
			],
		});
	}

	async onPrefixCheck(context: Context) {
		if (context.guildId) {
			const { Prefixes } = await CacheCollection.getOrFetch(context.guildId);

			if (Prefixes.length) return Prefixes.map((prefix) => prefix);

			return this.prefixes.custom;
		}
		return this.prefixes.custom;
	}

	onMessageCheck(context: Context): boolean | Promise<boolean> {
		if (context.user.bot) return false;
		return true;
	}
	async onCommandCheck(context: Context, command: Command<any>) {
		if (command.metadata.guildOwnerOnly) {
			if (context.member.isOwner || context.user.isClientOwner) {
				return true;
			} else {
				context.editOrReply('⚠ | Owner Only Command');
				return false;
			}
		}

		if (command.metadata.trustedOnly) {
			const guildData = await CacheCollection.getOrFetch(context.guildId);
			if (
				guildData.Users.Trusted.includes(context.userId) ||
				context.member.isOwner ||
				context.user.isClientOwner
			) {
				return true;
			} else {
				context.editOrReply('⚠ | Trusted Only Command');
				return false;
			}
		}

		return true;
	}
}
