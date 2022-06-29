import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { guildData, createData} from '../../../cache/guild.activity';
import { Embed } from 'detritus-client/lib/utils';
import { EmbedColors } from '../../../utils/constants';
import { Paginator } from '../../../utils/paginator';


export const COMMAND_NAME = 'recent activity';
export default class ServerCommand extends BaseCommand {
	constructor(client: CommandClient) {
		super(client, {
			name: COMMAND_NAME,
			aliases: ['activity'],
            disableDm: true,
			metadata: {
				description: 'Obtiene las recientes acciones dentro del servidor',
				examples: [COMMAND_NAME],
				type: 'info',
			},
			permissionsClient: [Permissions.EMBED_LINKS],
            permissions: [Permissions.VIEW_AUDIT_LOG]
		});
	}

	async run(context: Command.Context) {
		let data = guildData.get(context.guildId);

        if(!data) data = createData(context.guildId);

        const embeds: Array<Embed> = [];

		for (const value of ['Mentions', 'Bans', 'Emojis', 'Channels', 'Roles']) {
            const embed = new Embed({ color: EmbedColors.MAIN })
			.setTitle(`Actividad reciente de ${context.guild.name}`)
			.setThumbnail(context.guild.iconUrl)
			.setTimestamp()
            .addField(value, (data[value].map((value) => value.message).join('\n')) || '`Sin actividad reciente`');			
            embeds.push(embed);
        }
        const paginator = new Paginator(context, {
			lastPage: 5,
			onPage: (page) => {
				const embed = embeds[page]
                embed.setFooter(`Página ${page + 1} de ${embeds.length}`)
                return embed;
			}
		})
        return paginator.update()
	}
}