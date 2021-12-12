import { Collections, Command, Interaction, Structures } from 'detritus-client';
import { DiscordAbortCodes, InteractionCallbackTypes, MessageEmbedTypes, Permissions, StickerFormats } from 'detritus-client/lib/constants';
import { Embed, Markup, PermissionTools, intToHex } from 'detritus-client/lib/utils';
import { Response, replacePathParameters } from 'detritus-rest';
import { Timers } from 'detritus-utils';


export function isSnowflake(value: string): boolean {
  if (value.length !== 18 || isNaN(parseInt(value)) || !value.includes('.') || !value.includes(',')){
    return false;
  }
  return true;
}

export async function fetchUserById(
  context: Command.Context | Interaction.InteractionContext,
  userId: string,
): Promise<Structures.User | null> {
  if (context.user.id === userId) {
      return context.user;
    
  }
  try {
    const { guild } = context;
    if (context.users.has(userId)) {
      return context.users.get(userId) as Structures.User;
    }
    
    return await context.rest.fetchUser(userId);
  } catch(error: any) {
    // UNKNOWN_MEMBER == userId exists
    // UNKNOWN_USER == userId doesn't exist
    switch (error.code) {
      case DiscordAbortCodes.UNKNOWN_MEMBER: {
        return await context.rest.fetchUser(userId);
      };
      case DiscordAbortCodes.UNKNOWN_USER: {
        return null;
      };
      default: {
        throw error;
      };
    }
  }
  return null;
}

export async function getUserByText(context: Command.Context, text:string):Promise<Structures.User|null>{
    const {guild} = context;
    if(guild){
    let memberOrUser:Structures.User|null|undefined = context.users.get(text) || guild.members.find(member => member.user.tag.toLowerCase() === text.toLowerCase())?.user || guild.members.find(member => member.nick?.toLowerCase().includes(text.toLowerCase()) || false)?.user || guild.members.find(member => member.user.name.toLowerCase().includes(text.toLowerCase()))?.user
    if(!memberOrUser){
      if(!isSnowflake(text)) return null;
      return await fetchUserById(context, text)
    } else {
    return memberOrUser;
  }
    }
    return null
}

export function getUserByMention(context: Command.Context):Structures.User|null{
  if(context.message.mentions){
    
      return context.message.mentions.first() as Structures.User || context.message.mentions.first()
    
  }
  return null;

}