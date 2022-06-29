import { Command, CommandClient } from 'detritus-client';
import { devsIds } from '../../../../config.json';
import { Permissions } from 'detritus-client/lib/constants';
import {
	Embed,
	Markup,
} from 'detritus-client/lib/utils';
import { BaseCommand } from '../basecommand';
import { CommandCategory } from '../../../utils/commandCategory';
import { HelpCommandPaginator } from '../../../utils/paginator';
import { fetchUserById } from '../../../utils/functions';

export const COMMAND_NAME = 'help';

class HelpCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['commands', 'cmd'],
			metadata: {
				description: 'Obten los comandos del bot',
				type: 'info',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
		});
	}

	// @ts-expect-error
	onRunError(context: Command.Context, args: any, error: any) {
		console.log(error.errors.components['0']);
	}

	async run(context: Command.Context) {
		const basicEmbed = {
			color: 0x2f3136,
		};
        const devs = devsIds.map(async devId => `**[${(await fetchUserById(context, devId)).tag}](https://discord.com/users/${devId})**`)
		const mainEmbed = new Embed(basicEmbed)
			.setTitle('Menú Principal')
			.setThumbnail(context.client.user.avatarUrl)
			.setDescription(`Selecciona la categoria de comandos que necesites haciendo click en el menú de abajo\nPara obtener mas información de los sistemas del bot checa la [guia](https://docs.shardbot.xyz)\n\nPara reportar un fallo unete a [Sharding](https://discord.gg/x9ENapXbyW) o contactanos:\n${(await Promise.all(devs)).join('\n')}`);

		const lastPage = CommandCategory.ALL.length;

		const paginator = new HelpCommandPaginator(context, {
			mainEmbed,
			lastPage,
			timeout: 30 * 1000,
			onPage: (page) => {
				const current = page * 5;
				const category = CommandCategory.getCategory(paginator.currentCategory);
				const commands = this.commandClient.commands.filter(
					(command) => command.metadata.type === category.id
				);
				const currentCommands = commands.slice(current, current + 5);
				const description = currentCommands
					.map(
						(command) =>
							`${Markup.bold(
								'• ' +
									Markup.url(command.name, 'http://mod.shardbot.xyz/')
							)}\n${Markup.italics(
								command.metadata.description ?? 'Sin descripción'
							)}`
					)
					.join('\n'.repeat(2));

				paginator.setLastPage(this.roundPage(commands.length));

				const embed = new Embed(basicEmbed)
					.setTitle(category.fullNameReverse)
					.setDescription(`${category.description}\n\n${description}\n** **`)
					.setFooter(`Página ${[page + 1, paginator.lastPage].join('/')}`);

				return embed;
			},
		});

		await paginator.update();
	}

	private roundPage(lastPage: number, per: number = 5) {
		return Math.ceil(lastPage / per);
	}
}

export default HelpCommand;
