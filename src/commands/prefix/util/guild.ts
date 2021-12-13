import { Command, Structures, CommandClient } from 'detritus-client';
import { Permissions } from 'detritus-client/lib/constants';
import { BaseCommand } from '../basecommand';
import { Embed, intToHex } from 'detritus-client/lib/utils';
import {
   DiscordEmojis,
   EmbedColors,
   PERMISSIONS,
   PermissionsText,
   GuildContentFilterTypes,
   VerificationLevel,
} from '../../../utils/constants';

export const COMMAND_NAME = 'server';
export default class ServerCommand extends BaseCommand {
   constructor(client: CommandClient) {
      super(client, {
         name: COMMAND_NAME,
         aliases: ['sv', 'serverinfo', 'guild', 'guildinfo'],
         metadata: {
            description: 'Obtiene informacion del servidor',
            examples: [COMMAND_NAME],
            type: 'INFO',
         },
         permissionsClient: [Permissions.EMBED_LINKS],
      });
   }

   async run(context: Command.Context) {
      let { guild, message } = context;
      if (!guild) return context.editOrReply('⚠ | Servidor Desconocido');
      const embed = new Embed();
      embed.setAuthor(
         guild.name,
         guild.iconUrlFormat(null, { size: 1024 }) || undefined,
         guild.jumpLink
      );
      embed.setColor(EmbedColors.MAIN);
      embed.setDescription(guild.description);
      //info basica papu
      embed.addField(
         '**Información**',
         `
      **Propietario:** ${
         guild.owner ? `${guild.owner.mention} \`${guild.ownerId}\`` : 'Desconocido'
      }
      **Creación:** <t:${Math.round(guild.createdAtUnix / 1000)}:R>
      **Idioma:** ${guild.preferredLocaleText || guild.preferredLocale}
      **Tipo:** ${guild.isPublic ? 'Publico' : 'Privado'}
      **MemberCount:** ${guild.members.filter((member) => !member.user.bot).length} | ${
            guild.members.filter((member) => member.user.bot).length
         } Bots
      **BoostCount:** ${guild.premiumSubscriptionCount} | ${
            guild.premiumTier ? `Nivel ${guild.premiumTier}` : 'Nivel 0'
         }
     `,
         true
      );

      //canales establecidos a lo dou
      embed.addField(
         'Canales',
         `
       **Principal:** ${
          guild.channels.find((channel) => channel.position === 0 && channel.isGuildText)
             ?.mention || 'Desconocido'
       }
       **AFK:** ${guild.afkChannelId ? `<#${guild.afkChannelId}>` : 'Sin Establecer'}
       **Reglas:** ${guild.rulesChannelId ? `<#${guild.rulesChannelId}>` : 'Sin Establecer'}
       **Sistema:** ${guild.systemChannelId ? `<#${guild.systemChannelId}>` : 'Sin Establecer'}
       **Widget:** ${guild.widgetChannelId ? `<#${guild.widgetChannelId}>` : 'Sin Establecer'}
      `,
      true
      );
      //field vacio claro que si
      embed.addField('_ _', '_ _', false)
      
      //imagenes y footer lol
      if (guild.features.length) {
         embed.addField('Características', `\`\`\`${guild.features.join('\n')}\`\`\``, true);
      }

       //field de opciones de Moderación
      embed.addField(
         '**Moderación**',
         `
       **MFA**: ${guild.mfaLevel ? 'Requerido' : 'Opcional'}
       **Notificaciones**: ${guild.defaultMessageNotifications ? 'Menciones' : 'Todas'}
       **AFK Timeout:** ${guild.afkTimeout} segundos
       **Filtros de Contenido**: ${
          GuildContentFilterTypes[guild.explicitContentFilter] || 'Desconocido'
       }
       **Verificación**: ${VerificationLevel[guild.verificationLevel] || 'Desconocido'}
      `,
      true
      );

      if (guild.banner) {
         embed.setImage(`${guild.bannerUrlFormat(null, { size: 1024 })}`);
      }
      if (guild.splash) {
         embed.setThumbnail(`${guild.splashUrlFormat(null, { size: 1024 })}`);
      } else if (guild.icon) {
         embed.setThumbnail(`${guild.iconUrlFormat(null, { size: 1024 })}`);
      }
      embed.setFooter(`Server ShardID: ${guild.shardId}`);
      return context.editOrReply({ embeds: [embed] });
   }
}
