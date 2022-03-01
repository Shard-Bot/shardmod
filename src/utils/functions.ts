import { Command, Interaction, Structures } from 'detritus-client';
import { DiscordAbortCodes, Permissions } from 'detritus-client/lib/constants';
import { PermissionTools } from 'detritus-client/lib/utils';
import { DiscordRegex } from 'detritus-client/lib/constants';
import { defaultData, Model } from '../schemas/serverconfig';

export function isSnowflake(value: string): boolean {
  if (![16, 17, 18].includes(value.length) || isNaN(parseInt(value))) {
    return false;
  }

  return true;
}

export async function fetchUserById(
  context: Command.Context | Interaction.InteractionContext,
  userId: string
) {
  if (!isSnowflake(userId)) return null;
  const { guild } = context;
  if (context.user.id === userId) {
    return context.member || context.user;
  }

  try {
    if (guild) {
      if (guild.members.has(userId)) {
        return guild.members.get(userId);
      } else {
        return await guild.fetchMember(userId);
      }
    }
    if (context.users.has(userId)) {
      return context.users.get(userId) as Structures.User;
    }

    return await context.rest.fetchUser(userId);
  } catch (error: any) {
    switch (error.code) {
      case DiscordAbortCodes.UNKNOWN_MEMBER: {
        return await context.rest.fetchUser(userId);
      }
      case DiscordAbortCodes.UNKNOWN_USER: {
        return null;
      }
      default: {
        throw error;
      }
    }
  }
  return null;
}

export async function getUserByText(context: Command.Context, text: string) {
  if (isSnowflake(text)) return fetchUserById(context, text);
  const { guild } = context;

  if (guild) {
    const member =
      guild.members.get(text) ||
      guild.members.find(
        (member) =>
          member.user.tag.toLowerCase() === text.toLowerCase() ||
          member.name.toLowerCase().includes(text.toLowerCase())
      );

    return member ?? null;
  }

  return null;
}

export async function getGuildChannel(context: Command.Context, text: string) {
  const { guild } = context;
  if (guild) {
    if (text.match(DiscordRegex.MENTION_CHANNEL)) {
      const channel = guild.channels.get(text.replace(/(<#|>)/gi, ''));
      if (channel) return channel;
    }
    const channel =
      guild.channels.get(text) ||
      guild.channels.find((channel) => channel.name.toLowerCase().includes(text.toLowerCase()));

    return channel ?? null;
  }

  return null;
}

export async function getGuildRole(context: Command.Context, text: string) {
  const { guild } = context;
  if (guild) {
    const role =
      guild.roles.get(text) ||
      guild.roles.find((role) => role.name.toLowerCase().includes(text.toLowerCase()));

    return role ?? null;
  }

  return null;
}

export function getMemberJoinPosition(guild: Structures.Guild, userId: string): [number, number] {
  let members;
  members = guild.members.sort((x, y) => x.joinedAtUnix - y.joinedAtUnix);
  const joinPosition = members.findIndex((m) => m.id === userId) + 1;
  return [joinPosition, guild.members.length];
}

export function permissionsToObject(permissions: bigint | number): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (let check of Object.values(Permissions)) {
    if (check === Permissions.NONE) {
      continue;
    }
    result[String(check)] = PermissionTools.checkPermissions(permissions, check);
  }
  return result;
}

export function clearString(value: string): string {
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    })
    .join(' ');
}

export async function createData(guildId: string) {
  const data = await Model.create(defaultData(guildId));
  return data.toObject()
}

export async function timeoutMember(args: {member: Structures.Member, reason: string, time?: number}) {
	if(args.time){
    args.member.edit({ communicationDisabledUntil: new Date(Date.now() + args.time).toISOString(), reason: args.reason });
  } else {
    args.member.edit({ communicationDisabledUntil: null, reason: args.reason });
  }
}

export function canTimeout(guild: Structures.Guild, member: Structures.Member){
		if (guild.me.canEdit(member) && guild.me.can(1 << 40)) return true;
		return false;
}

export function createId(length: number){
  let ch = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz1234567890';
  let result = "";
  for(var i = 0; i < length; i++){
      result += ch.charAt(Math.floor(Math.random() * ch.length))
  }
return result;
}