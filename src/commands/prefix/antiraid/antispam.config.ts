import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed } from 'detritus-client/lib/utils';
import { Model } from '../../../schemas/serverconfig';
import { EmbedColors, AntiSpamModules, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';
import ms from 'ms';
export const COMMAND_NAME = 'antispam config';
type param = {
	module: string;
	show: boolean;
	percent: number;
	limit: number;
	allowimages: boolean;
	status: string;
	percenttimelimit: string;
};

export default class AntinukesConfigCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['as config', 'antispam c', 'as c'],
			disableDm: true,
			args: [
				{ name: 'show', type: Boolean, required: false, aliases: ['display'] },
				{ name: 'percent', type: Number, required: false },
				{ name: 'limit', type: Number, required: false, aliases: ['limite'] },
				{ name: 'allowimages', type: Boolean, required: false },
				{ name: 'status', type: String, required: false, aliases: ['estado'] },
				{
					name: 'percenttimelimit',
					type: String,
					required: false,
					aliases: ['timelimit', 'timeout'],
				},
			],
			label: 'module',
			metadata: {
				trustedOnly: true,
				description: 'Comando de configuracion del sistema AntiSpam',
				usage: '[Modulo/Sistema] [-limit] [-status] [-show] [-percent] [-timeout] [-allowimages]',
				example: [`${COMMAND_NAME} maxBans -limit 5`],
				type: 'antiRaid',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	async run(context: Command.Context, args: param) {
		let providedModule = args.module;
		let module: string =
			AntiSpamModules[providedModule.toLowerCase()] ||
			Object.values(AntiSpamModules)[parseInt(providedModule) - 1];
		if (providedModule.length && !module)
			return context.editOrReply('⚠ | Modulo desconocido');
		const serverData = await CacheCollection.getOrFetch(context.guildId);
		if (args.show) {
			const embed = new Embed();
			embed.setTitle('AntiSpam Config Panel');
			embed.setColor(EmbedColors.MAIN);
			if (module) {
				let description: string[] = [];
				let data = serverData.Modules[module];
				description.push(
					`• Estado: ${
						data.Enabled === true ? DiscordEmojis.ON : DiscordEmojis.OFF
					}`
				);
				if (data.Limit) description.push(`• Limite: \`${data.Limit}\``);
				if (data.Percent) description.push(`• Percent: \`${data.Percent}%\``);
				if (data.PercentTimeLimit)
					description.push(
						`• Percent Timeout: \`${
							data.PercentTimeLimit < 60
								? `${data.PercentTimeLimit}s`
								: `${data.PercentTimeLimit / 60}m`
						}\``
					);
				if (data.Words) description.push(`• Words: \`${data.Words.length}\``);
				if (typeof data.AllowImages !== 'undefined')
					description.push(
						`• AllowImages: \`${data.AllowImages === true ? 'Si' : 'No'}\``
					);
				embed.addField(
					`[${Object.values(AntiSpamModules).indexOf(module) + 1}] ${module}`,
					description.join('\n')
				);
			} else {
				Object.values(AntiSpamModules).map((key: string, i: number) => {
					let description: string[] = [];
					let data = serverData.Modules[key];
					description.push(
						`• Estado: ${
							data.Enabled === true ? DiscordEmojis.ON : DiscordEmojis.OFF
						}`
					);
					if (data.Limit) description.push(`• Limite: \`${data.Limit}\``);
					if (data.Percent) description.push(`• Percent: \`${data.Percent}%\``);
					if (data.PercentTimeLimit)
						description.push(
							`• Percent Timeout: \`${
								data.PercentTimeLimit < 60
									? `${data.PercentTimeLimit}s`
									: `${data.PercentTimeLimit / 60}m`
							}\``
						);
					if (data.Words) description.push(`• Words: \`${data.Words.length}\``);
					if (typeof data.AllowImages !== 'undefined')
						description.push(
							`• AllowImages: \`${
								data.AllowImages === true ? 'Si' : 'No'
							}\``
						);
					embed.addField(
						`[${i + 1}] ${key}`,
						description.join('\n'),
						i + 1 === 3 ? false : true
					);
				});
			}
			return context.reply({ embeds: [embed] });
		}
		if (!module) return context.editOrReply('⚠ | Especifica el modulo');

		if (args.percent) {
			if (!serverData.Modules[module].Percent)
				return context.editOrReply(
					'⚠ | No puedes establecer el valor `Percent` en este modulo'
				);
			if (!Number.isInteger(args.percent))
				return context.editOrReply('⚠ | Numero invalido');
			if (args.percent > 100)
				return context.editOrReply(
					'⚠ | Especifica un porcentaje valido ( entre 1 y 100)'
				);
			if (args.percent === serverData.Modules[module].Percent)
				return context.editOrReply('⚠ | Ese valor ya esta establecido');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{ $set: { [`Modules.${module}.Percent`]: args.percent } }
			);
			return context.editOrReply(
				`El porcentaje de \`${module}\` se ha establecido a \`${args.percent}%\``
			);
		}

		if (args.limit) {
			if (!serverData.Modules[module].Limit)
				return context.editOrReply(
					'⚠ | No puedes establecer el valor `Limit` en este modulo'
				);
			if (!Number.isInteger(args.limit))
				return context.editOrReply('⚠ | Numero invalido');
			if (args.limit > 1000 || args.limit < 30)
				return context.editOrReply(
					'⚠ | Especifica un porcentaje valido ( entre 30 y 1000)'
				);
			if (args.limit === serverData.Modules[module].Limit)
				return context.editOrReply('⚠ | Ese valor ya esta establecido');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{ $set: { [`Modules.${module}.Limit`]: args.limit } }
			);
			return context.editOrReply(
				`El Limite de \`${module}\` se ha establecido a \`${args.limit}\``
			);
		}

		if (args.allowimages) {
			if (typeof serverData.Modules[module].AllowImages === 'undefined')
				return context.editOrReply(
					'⚠ | No puedes establecer el valor `AllowImages` en este modulo'
				);
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Modules.${module}.AllowImages`]:
							serverData.Modules[module].AllowImages === true
								? false
								: true,
					},
				}
			);
			return context.editOrReply(
				`El modulo \`${module}\` ha \`${
					serverData.Modules[module].AllowImages === true
						? 'denegado'
						: 'permitido'
				}\` el envio de imagenes`
			);
		}

		if (args.status) {
			if (!['on', 'off'].includes(args.status.toLowerCase()))
				return context.editOrReply('⚠ | Especifica una accion valida');
			if (
				args.status.toLowerCase() === 'on' &&
				serverData.Modules[module].Enabled === true
			)
				return context.editOrReply('⚠ | El modulo ya se encuentra encendido');

			if (
				args.status.toLowerCase() === 'off' &&
				serverData.Modules[module].Enabled === false
			)
				return context.editOrReply('⚠ | El modulo ya se encuentra apagado');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Modules.${module}.Enabled`]:
							args.status.toLowerCase() === 'on' ? true : false,
					},
				}
			);
			return context.editOrReply(
				`El modulo \`${module}\` ha sido ${
					args.status.toLowerCase() === 'on' ? 'Encendido' : 'Apagado'
				}`
			);
		}

		if (args.percenttimelimit) {
			if (!serverData.Modules[module].PercentTimeLimit)
				return context.editOrReply(
					'⚠ | No puedes establecer el valor `PercentTimeLimit` en este modulo'
				);
			const stime = ms(args.percenttimelimit) / 1000;
			if (isNaN(stime) || !Number.isInteger(stime))
				return context.editOrReply('⚠ | Establece un tiempo valido');
			if (stime > 300)
				return context.editOrReply('⚠ | La duración no puede execer 5m');
			if (stime < 5)
				return context.editOrReply('⚠ | La duración no puede ser menor a 5s');
			if (serverData.Modules[module].PercentTimeLimit === stime)
				return context.editOrReply('Ese valor ya se encuentra establecido');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{ $set: { [`Modules.${module}.PercentTimeLimit`]: stime } }
			);
			return context.editOrReply(
				`El Limite de \`${module}\` se ha establecido a \`${args.percenttimelimit}\` (${stime} segundos)`
			);
		}
	}
}
