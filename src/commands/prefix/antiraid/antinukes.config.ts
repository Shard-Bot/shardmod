import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed } from 'detritus-client/lib/utils';
import { Model } from '../../../schemas/serverconfig';
import { EmbedColors, AntiNukesModules, DiscordEmojis } from '../../../utils/constants';
import CacheCollection from '../../../cache/CacheCollection';

export const COMMAND_NAME = 'antinuke config';
type param = {
	module: string;
	show: boolean;
	status: string;
	limit: number;
	ignoreverified: boolean;
};

export default class AntinukesConfigCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['an config', 'antinuker config', 'an c', 'antinukes config'],
			disableDm: true,
			args: [
				{ name: 'limit', type: Number, required: false, aliases: ['limite'] },
				{ name: 'status', type: String, required: false, aliases: ['estado'] },
				{ name: 'show', type: Boolean, required: false, aliases: ['display'] },
				{
					name: 'ignoreverified',
					type: Boolean,
					required: false,
					aliases: ['ignoreverifiedbots'],
				},
			],
			label: 'module',
			metadata: {
				trustedOnly: true,
				description: 'Comando de configuracion del sistema Antinuke',
				usage: [`${COMMAND_NAME} [Modulo/Sistema] [-limit] [-status] [-show]`],
				example: [
					`${COMMAND_NAME} maxBans -limit 5`,
					`${COMMAND_NAME} maxKicks -status off`,
					`${COMMAND_NAME} -show`,
				],
				type: 'Anti Raid',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}
	async run(context: Command.Context, args: param) {
		let providedModule = args.module;
		let module: string =
			AntiNukesModules[providedModule.toLowerCase()] ||
			Object.values(AntiNukesModules)[parseInt(providedModule) - 1];
		if (providedModule.length && !module) return context.editOrReply('⚠ | Modulo desconocido');
		const serverData = CacheCollection.get(context.guildId);
		if (args.show) {
			const embed = new Embed();
			embed.setTitle('Antinuke Config Panel');
			embed.setColor(EmbedColors.MAIN);
			if (module) {
				let description: string[] = [];
				description.push(
					`**•** Estado: ${
						serverData.Modules.AntiNuker.Config[module].Enabled === true
							? `${DiscordEmojis.ON}`
							: `${DiscordEmojis.OFF}`
					}`
				);
				if (typeof serverData.Modules.AntiNuker.Config[module].IgnoreVerified !== 'undefined')
					description.push(
						`**•** IgnoreVerifiedBots: ${
							serverData.Modules.AntiNuker.Config[module].IgnoreVerified === true
								? `${DiscordEmojis.ON}`
								: `${DiscordEmojis.OFF}`
						}`
					);
			    if(module !== 'maxInvitedBots') description.push(`**•** Limite: ${serverData.Modules.AntiNuker.Config[module].Limit}`);

				embed.addField(
					`[${Object.values(AntiNukesModules).indexOf(module) + 1}] ${module}`,
					description.join('\n')
				);
			} else {
				Object.values(AntiNukesModules).map((key: string, i: number) => {
					let description: string[] = [];
					description.push(
						`**•** Estado: ${
							serverData.Modules.AntiNuker.Config[key].Enabled === true
								? `${DiscordEmojis.ON}`
								: `${DiscordEmojis.OFF}`
						}`
					);
					if (typeof serverData.Modules.AntiNuker.Config[key].IgnoreVerified !== 'undefined')
						description.push(
							`**•** IgnoreVerifiedBots: ${
								serverData.Modules.AntiNuker.Config[key].IgnoreVerified === true
									? `${DiscordEmojis.ON}`
									: `${DiscordEmojis.OFF}`
							}`
						);
					if(key !== 'maxInvitedBots')description.push(`**•** Limite: ${serverData.Modules.AntiNuker.Config[key].Limit}`);
					embed.addField(`[${i + 1}] ${key}`, description.join('\n'), true);
				});
			}

			return context.editOrReply({ embeds: [embed] });
		}
		if (!providedModule) return context.editOrReply('⚠ | Especifica el modulo');
		if (args.limit) {
			if(module === 'maxInvitedBots') return context.editOrReply('⚠ | No puedes establecer un limite en el evento `maxInvitedBots`');
			if (args.status || args.show)
				return context.editOrReply('⚠ | No puedes usar mas de 1 argumento');
			if (!Number.isInteger(args.limit)) return context.editOrReply('⚠ | Limite invalido');
			if (args.limit > 10 || args.limit < 2)
				return context.editOrReply('⚠ | Especifica un numero valido entre 2 y 10');
			if (args.limit === serverData.Modules.AntiNuker.Config[module].Limit)
				return context.editOrReply('⚠ | Ese valor ya esta establecido');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{ $set: { [`Modules.AntiNuker.Config.${module}.Limit`]: args.limit } }
			);
			return context.editOrReply(
				`El limite de \`${module}\` se ha establecido a \`${args.limit}\``
			);
		}
		if (args.status) {
			if (args.limit || args.show)
				return context.editOrReply('⚠ | No puedes usar mas de 1 argumento');
			if (!['on', 'off'].includes(args.status.toLowerCase()))
				return context.editOrReply('⚠ | Especifica una accion valida');
			if (
				args.status.toLowerCase() === 'on' &&
				serverData.Modules.AntiNuker.Config[module].Enabled === true
			)
				return context.editOrReply('⚠ | El evento ya se encuentra encendido');

			if (
				args.status.toLowerCase() === 'off' &&
				serverData.Modules.AntiNuker.Config[module].Enabled === false
			)
				return context.editOrReply('⚠ | El evento ya se encuentra apagado');
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Modules.AntiNuker.Config.${module}.Enabled`]:
							args.status.toLowerCase() === 'on' ? true : false,
					},
				}
			);
			return context.editOrReply(
				`El evento \`${module}\` ha sido ${
					args.status.toLowerCase() === 'on' ? 'Encendido' : 'Apagado'
				}`
			);
		}
		if (args.ignoreverified) {
			if (typeof serverData.Modules.AntiNuker.Config[module].IgnoreVerified === 'undefined')
				return context.editOrReply(
					'⚠ | No puedes establecer el argumento `ignoreVerified` en este modulo'
				);
			await Model.findOneAndUpdate(
				{ ServerID: context.guildId },
				{
					$set: {
						[`Modules.AntiNuker.Config.${module}.IgnoreVerified`]:
							serverData.Modules.AntiNuker.Config[module].IgnoreVerified === false
								? true
								: false,
					},
				}
			);
			return context.editOrReply(
				`Se ha ${
					serverData.Modules.AntiNuker.Config[module].IgnoreVerified === false
						? '`Activado`'
						: '`Desactivado`'
				} la opción Ignore Verified Bots.`
			);
		}
	}
	onSuccess(context: Command.Context) {
		CacheCollection.loadData(context.guildId!);
	}
}