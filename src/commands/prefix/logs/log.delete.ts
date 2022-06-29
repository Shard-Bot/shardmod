import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { BotLogs } from '../../../utils/constants';
import { getGuildChannel } from '../../../utils/functions';
import CacheCollection from '../../../cache/CacheCollection';
import { Model } from '../../../schemas/serverconfig';
export const COMMAND_NAME = 'log remove';
type param = {
	event: string;
};

export default class logDeleteCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['l remove', 'l delete', 'log delete', 'log del'],
			args: [{ name: 'event', type: String, required: true, aliases: ['evento'] }],
			disableDm: true,
			metadata: {
				description: 'Remueve un canal de logeo de acciones del servidor',
				usage: '[-event]',
				example: [`${COMMAND_NAME} -event Joins`],
				type: 'botConfig',
			},
			permissions: [Permissions.MANAGE_GUILD],
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}

	async run(context: Command.Context, args: param) {
		const document = await CacheCollection.getOrFetch(context.guildId);
		const event = args.event;

		switch (event.toLocaleLowerCase()) {
			case 'entradas':
			case 'joins':
				if (!document.Channels.JoinLog.length)
					return context.editOrReply('Este evento no tiene un canal establecido');
				await Model.findOneAndUpdate(
					{ ServerID: context.guildId },
					{ $set: { [`Channels.JoinLog`]: '' } }
				);
				return context.editOrReply(`Canal fue correctamente removido del evento Joinlog`);
				break;
			case 'salidas':
			case 'leaves':
				if (!document.Channels.ExitLog.length)
					return context.editOrReply('Este evento no tiene un canal establecido');
				await Model.findOneAndUpdate(
					{ ServerID: context.guildId },
					{ $set: { [`Channels.ExitLog`]: '' } }
				);
				return context.editOrReply(`Canal fue correctamente removido del evento Exitlog`);
				break;
			case 'modactions':
			case 'modlog':
				if (!document.Channels.ModLog.length)
					return context.editOrReply('Este evento no tiene un canal establecido');
				await Model.findOneAndUpdate(
					{ ServerID: context.guildId },
					{ $set: { [`Channels.ModLog`]: '' } }
				);
				return context.editOrReply(`Canal fue correctamente removido del evento Modlog`);
				break;
			case 'modlog':
				if (!document.Channels.BotLog.length)
					return context.editOrReply('Este evento no tiene un canal establecido');
				await Model.findOneAndUpdate(
					{ ServerID: context.guildId },
					{ $set: { [`Channels.BotLog`]: '' } }
				);
				return context.editOrReply(`Canal fue correctamente removido del evento Botlog`);
				break;
			case 'all':
				const success: string[] = [];
				for (const _module of BotLogs) {
					if (document.Channels[_module].length) {
						await Model.findOneAndUpdate(
							{ ServerID: context.guildId },
							{ $set: { [`Channels.${_module}`]: '' } }
						);
						success.push(_module);
					}
				}
				if (success.length) {
					return context.editOrReply(
						`Los eventos \`${success.join(' ')}\` fueros correctamente removidos`
					);
				} else {
					return context.editOrReply('Ningun evento tiene un canal establecido');
				}
				break;
			default:
				return context.editOrReply('Especifica un modulo valido');
		}
	}
}
