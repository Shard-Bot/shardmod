import { Command, Interaction, Structures } from 'detritus-client';

export function isSnowflake(value: string): boolean {
  if (![16, 17, 18].includes(value.length) || isNaN(parseInt(value))) {
    return false;
  }

  return true;
}

export async function fetchUserById(
  context: Command.Context | Interaction.InteractionContext,
  userId: string,
) {
  if (!isSnowflake(userId)) return null;

  if (context.user.id === userId) {
    return context.user;
  }

  try {
    if (context.users.has(userId)) {
      return context.users.get(userId) as Structures.User;
    }

    return await context.rest.fetchUser(userId);
  } catch {
    return null
  }

}

export async function getUserByText(context: Command.Context, text: string) {
  if (isSnowflake(text)) return fetchUserById(context, text)
  const { guild } = context;

  if (guild) {
    const member = context.users.get(text) ||
      guild.members.find(member =>
        (member.user.tag.toLowerCase() === text.toLowerCase()) ||
        (member.name.toLowerCase().includes(text.toLowerCase()))
      )?.user

    return member ?? null
  }

  return null
}

export function getUserByMention(context: Command.Context): Structures.User | null {
  if (context.message.mentions) {
    const mention = context.message.mentions.first()!
    if (mention instanceof Structures.Member) return mention.user
    return mention
  }
  return null;
}