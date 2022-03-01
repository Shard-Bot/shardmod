import { Collections, Structures } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import Client from '../client';

const deletedMessages = new Collections.BaseCollection<string, { message: Structures.Message }[]>();
const editedMessages = new Collections.BaseCollection<string, { message: Structures.Message }[]>();

Client.on(ClientEvents.MESSAGE_DELETE, (payload) => {
	let snipes = deletedMessages.get(payload.channelId) || [];
	if (snipes.length > 10) snipes = snipes.slice(0, 10);

	snipes.unshift({
		message: payload.message,
	});
	deletedMessages.set(payload.channelId, snipes);
});
Client.on(ClientEvents.MESSAGE_UPDATE, (payload) => {
	let snipes = editedMessages.get(payload.channelId) || [];
	if (snipes.length > 10) snipes = snipes.slice(0, 10);

	snipes.unshift({
		message: payload.old,
	});
	editedMessages.set(payload.channelId, snipes);
});

export { deletedMessages, editedMessages };
