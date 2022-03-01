import * as mongoose from 'mongoose';
import { GuildWarns } from '../utils/types';

export const defaultData = (guildId: string) => ({
	ServerID: guildId,
	Maxwarns: 8,
	Action: 'Timeout',
	Warns: [],
});

const Schema = new mongoose.Schema(
	{
		ServerID: String,
		Maxwarns: Number,
		Action: String,
		Warns: [{ id: String, reason: String, date: Number, moderatorId: String, targetId: String }],
	},
	{ versionKey: false }
);

export const Model = mongoose.model<GuildWarns>('GuildWarns', Schema);
