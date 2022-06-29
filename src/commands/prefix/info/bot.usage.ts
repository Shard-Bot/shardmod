import { Command, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import os from 'os'
import { Markup } from 'detritus-client/lib/utils';
export const COMMAND_NAME = 'usage';

export default class UsageCommand extends BaseCommand {
  constructor(client: CommandClient) {
    super(client, {
      name: COMMAND_NAME,
      aliases: ['botinfo'],
      metadata: {
        description: 'Obtiene informacion del uso de recursos del bot',
        example: [COMMAND_NAME],
        type: 'info',
      },
      permissionsClient: [Permissions.SEND_MESSAGES],
    });
  }

  async run(context: Command.Context) {
    const { gateway, rest } = await context.client.ping();
    const uptime = {
        days: Math.floor(process.uptime() / 86400),
        hours: Math.floor(process.uptime() / 3600) % 24,
        minutes: Math.floor(process.uptime() / 60) % 60
    }

    const description = []
    description.push('BOT USAGE\n')
    description.push(`RAM USADA: ${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB`)
    description.push(`CPU: ${this.getCPU()}%`)
    description.push(`LATENCY: Gateway ${gateway}ms • Rest ${rest}ms`)
    description.push(`UPTIME: ${uptime.days} Days | ${uptime.hours} Hours | ${uptime.minutes} Minutes`)
    description.push(`GUILDS: ${context.guilds.length}`)
    description.push(`USERS: ${context.guilds.reduce((prev, guild) => prev + guild.memberCount, 0)} (${context.client.users.length} on Cache)`)
    
    return context.editOrReply({
      content: Markup.codeblock(description.join('\n'), {language: 'py'}),
      reference: true,
    })
  }
  getCPU(){
    const load = os.loadavg();
    return load[0]
  }
}