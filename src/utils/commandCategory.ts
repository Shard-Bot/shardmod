export enum CommandTypes {
	INFO = 'info',
	MODERATION = 'moderation',
	ANTI_RAID = 'antiRaid',
	BOT_CONFIG = 'botConfig',
	OWNER = 'owner',
}

export interface ICommandCategory {
	name: string;
	description: string;
	emoji: string;
	hidden?: boolean;
}

export const commandCategories: { [name: string]: ICommandCategory } = {
	[CommandTypes.INFO]: {
		name: 'Información',
		get description() {
			return `Comandos de ${this.name}`;
		},
		emoji: '📖',
	},
	[CommandTypes.ANTI_RAID]: {
		name: 'Anti-Raid',
		description: 'Comandos para configurar el sistema anti-raid.',
		emoji: '🛡',
	},
	[CommandTypes.MODERATION]: {
		name: 'Moderación',
		description: 'Comandos para moderar el servidor.',
		emoji: '🔨',
	},
	[CommandTypes.BOT_CONFIG]: {
		name: 'Configuración',
		description: 'Comandos para configuración general el bot.',
		emoji: '⚙',
	},
	[CommandTypes.OWNER]: {
		name: 'Desarrollo',
		description: 'Comandos exclusivos para desarrolladores.',
		emoji: '💻',
		hidden: true,
	},
};

export class CommandCategory {
	name: string;
	description: string;
	emoji: string;
	hidden?: boolean;

	constructor(category: ICommandCategory) {
		Object.assign(this, category);
	}

	get fullName() {
		return `${this.emoji} ${this.name}`;
	}

	get fullNameReverse() {
		return `${this.name} ${this.emoji}`;
	}

	get isHidden() {
		return !!this.hidden;
	}

	get id() {
		const keys = Object.keys(commandCategories);

		return keys.find((key) => commandCategories[key].name === this.name);
	}

	static get ALL() {
		const array = Object.values(commandCategories);

		return array.map((category) => new this(category));
	}

	static getCategory(commandType: string) {
		const category = commandCategories[commandType];

		return new this(category);
	}
}
