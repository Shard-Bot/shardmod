import { GatewayClientEvents } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import {
	Embed,
	Components,
	ComponentContext,
	ComponentSelectMenu,
} from 'detritus-client/lib/utils';
import {
	MessageFlags,
	InteractionCallbackTypes,
	MessageComponentButtonStyles,
	ClientEvents,
	MessageComponentTypes,
} from 'detritus-client/lib/constants';
import { Message } from 'detritus-client/lib/structures';
import { CommandCategory } from './commandCategory';

export type OnPage = (page: number, pageObject?: any[]) => Promise<Embed> | Embed;

export type Content = (page: number, pageObject?: any[]) => string;

export enum Buttons {
	PREVIOUS = 'previous',
	CANCEL = 'cancel',
	JUMP = 'jump',
	NEXT = 'next',
}

export enum ButtonNames {
	PREVIOUS = 'Atrás',
	CANCEL = 'Cancelar',
	JUMP = 'Saltar',
	NEXT = 'Siguiente',
}

export interface Options {
	baseArray?: any[];
	content?: Content;
	timeout?: number;
	onPage: OnPage;
	page?: number;
	lastPage?: number;
	pageObject?: number;
}

export class Paginator implements Options {
	context: Context;
	content?: Content;
	onPage: OnPage;
	baseArray?: any[] = [];
	timeout? = 1000 * 60;
	page = 0;
	lastPage: number;
	pageObject = 0;
	jump: {
		message?: Message | null;
		context?: ComponentContext | null;
		active: boolean;
	} = {
		active: false,
	};

	constructor(context: Context, options: Options) {
		this.context = context;
		this.onPage = options.onPage;

		if (options.content) this.content = options.content;
		if (options.baseArray) this.baseArray = options.baseArray;
		if (options.timeout) this.timeout = options.timeout;
		if (options.pageObject) this.pageObject = options.pageObject;

		this.lastPage = options.lastPage;

		context.client.subscribe(ClientEvents.MESSAGE_CREATE, this.onMessage.bind(this));
	}

	async cancel() {
		const { content, embed } = await this.currentPage();

		await this.context.editOrReply({
			content: content ? `~~${content}~~` : undefined,
			embed,
			components: [],
		});
	}

	get components() {
		const row = new Components({
			run: this.updatePage.bind(this),
			onError: console.error,
			timeout: this.timeout,
			onTimeout: this.cancel.bind(this),
		});

		if (!(this.page === 1 && this.page === this.lastPage)) {
			row.createButton({
				label: ButtonNames.PREVIOUS,
				customId: Buttons.PREVIOUS,
				disabled: this.page === 0,
			});

			row.createButton({
				label: ButtonNames.CANCEL,
				customId: Buttons.CANCEL,
				style: MessageComponentButtonStyles.DANGER,
			});

			row.createButton({
				label: ButtonNames.JUMP,
				customId: Buttons.JUMP,
				style: this.jump.active
					? MessageComponentButtonStyles.DANGER
					: MessageComponentButtonStyles.SECONDARY,
			});

			row.createButton({
				label: ButtonNames.NEXT,
				customId: Buttons.NEXT,
				disabled: this.page + 1 === this.lastPage,
			});
		}

		return row;
	}

	async currentPage() {
		const embed = await this.onPage(this.page);
		const content = this.content?.(this.page);
		return {
			embed,
			content,
		};
	}

	setPage(page: number) {
		this.page = page;
	}

	setLastPage(page: number) {
		this.lastPage = page;
	}

	async update() {
		const { embed, content } = await this.currentPage();

		return this.context.editOrReply({
			embed,
			content,
			components: this.components,
		});
	}

	async onMessage({ message }: GatewayClientEvents.MessageCreate) {
		if (
			message.fromBot ||
			message.author.id !== this.context.userId ||
			!message.content ||
			!this.jump.message
		)
			return;

		const page = parseInt(message.content);
		if (isNaN(page) || page > this.lastPage! || 1 > page)
			return this.throwInvalidPage();

		this.setPage(page - 1);

		if (message.canDelete) await message.delete();

		await this.clearMessage(`Saltando a la página **${page}**`);
		await this.update();
	}

	async throwInvalidPage() {
		const { message, context } = this.jump;

		await context.editMessage(message.id, {
			content:
				':warning: Página inválida, escribe de nuevo una válida o pulsa de nuevo el boton para cancelar',
		});
	}

	async clearMessage(content = `Cancelado`) {
		const { message, context } = this.jump;

		context.editMessage(message.id, { content });

		this.jump.active = false;
		this.jump.message = null;
		this.jump.context = null;
	}

	async updatePage(context: ComponentContext) {
		if (context.userId !== this.context.userId)
			return context.createMessage({
				content: 'No puedes usar esto.',
				flags: MessageFlags.EPHEMERAL,
			});

		await context.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);

		switch (context.customId) {
			case Buttons.PREVIOUS:
				this.setPage(this.page - 1);
				break;

			case Buttons.CANCEL:
				return this.cancel();

			case Buttons.JUMP:
				if (this.jump.active) await this.clearMessage();
				else {
					this.jump.message = await context.createMessage({
						content: '¿A qué página quieres ir?',
						flags: MessageFlags.EPHEMERAL,
					});

					this.jump.context = context;
					this.jump.active = true;
				}
				break;

			case Buttons.NEXT:
				this.setPage(this.page + 1);
				break;
		}

		await this.update();
	}
}

interface HelpCommandPaginatorOptions extends Options {
	mainEmbed: Embed;
}

export class HelpCommandPaginator extends Paginator {
	currentCategory = '';
	mainMenuEmbed: Embed;
	mainMenuActive = true;

	constructor(context: Context, options: HelpCommandPaginatorOptions) {
		super(context, options);

		this.mainMenuEmbed = options.mainEmbed;
	}

	setCurrentCategory(categoryId: string) {
		this.currentCategory = categoryId;
	}

	setMainMenuActive(status: boolean = true) {
		this.mainMenuActive = status;
	}

	get mainMenuButton() {
		return {
			label: 'Menú',
			customId: 'main_menu',
			style: MessageComponentButtonStyles.SECONDARY,
			disabled: this.mainMenuActive,
		};
	}

	get components() {
		const row = new Components({
			run: this.updatePage.bind(this),
			onError: console.error,
			timeout: this.timeout,
			onTimeout: this.cancel.bind(this),
		});

		const menu = new ComponentSelectMenu()
			.setCustomId('help_commands')
			.setPlaceholder('Selecciona una Categoría');

		for (const category of CommandCategory.ALL) {
			menu.createOption({
				label: category.name,
				value: category.id,
				emoji: category.emoji,
				description: category.description,
			});
		}

		row.addSelectMenu(menu);

		if (!this.mainMenuActive && !(this.page === 1 && this.page === this.lastPage)) {
			row.createButton({
				label: ButtonNames.PREVIOUS,
				customId: Buttons.PREVIOUS,
				disabled: this.page === 0,
			});

			row.createButton(this.mainMenuButton);

			row.createButton({
				label: ButtonNames.CANCEL,
				customId: Buttons.CANCEL,
				style: MessageComponentButtonStyles.DANGER,
			});

			row.createButton({
				label: ButtonNames.JUMP,
				customId: Buttons.JUMP,
				style: this.jump.active
					? MessageComponentButtonStyles.DANGER
					: MessageComponentButtonStyles.SECONDARY,
			});

			row.createButton({
				label: ButtonNames.NEXT,
				customId: Buttons.NEXT,
				disabled: this.page + 1 === this.lastPage,
			});
		}

		return row;
	}

	async cancel() {
		const current = await this.currentPage();
		const embed = this.mainMenuActive ? this.mainMenuEmbed : current.embed;

		await this.context.editOrReply({
			content: current.content ? `~~${current.content}~~` : undefined,
			embed,
			components: [],
		});
	}

	async update() {
		const current = await this.currentPage();
		const embed = this.mainMenuActive ? this.mainMenuEmbed : current.embed;

		return this.context.editOrReply({
			embed,
			content: current.content,
			components: this.components,
		});
	}

	async updatePage(context: ComponentContext) {
		if (context.userId !== this.context.userId)
			return context.createMessage({
				content: 'No puedes usar esto.',
				flags: MessageFlags.EPHEMERAL,
			});

		switch (context.data.componentType) {
			case MessageComponentTypes.SELECT_MENU:
				await this.selectMenuRun(context);
				break;

			case MessageComponentTypes.BUTTON:
				await this.buttonRun(context);
				break;
		}
	}

	async selectMenuRun(context: ComponentContext) {
		const [categoryId] = context.data.values;
		const category = CommandCategory.getCategory(categoryId);

		if (!category.id) return;

		await context.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);

		if (this.currentCategory === category.id && !this.setMainMenuActive) return;

		this.setPage(0);
		this.setCurrentCategory(category.id);

		this.setMainMenuActive(false);

		await this.update();
	}

	async buttonRun(context: ComponentContext) {
		await context.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);

		this.setMainMenuActive(context.customId === this.mainMenuButton.customId);

		switch (context.customId) {
			case Buttons.PREVIOUS:
				this.setPage(this.page - 1);
				break;

			case Buttons.CANCEL:
				return this.cancel();

			case Buttons.JUMP:
				if (this.jump.active) await this.clearMessage();
				else {
					this.jump.message = await context.createMessage({
						content: '¿A qué página quieres ir?',
						flags: MessageFlags.EPHEMERAL,
					});

					this.jump.context = context;
					this.jump.active = true;
				}
				break;

			case Buttons.NEXT:
				this.setPage(this.page + 1);
				break;
		}

		await this.update();
	}
}
