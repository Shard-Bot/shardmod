import { Command, Interaction, Utils } from 'detritus-client';
import {
	MessageFlags,
	MessageComponentButtonStyles,
} from 'detritus-client/lib/constants';
import { Components, Embed } from 'detritus-client/lib/utils';
import { DiscordEmojis, EmbedColors } from './constants';

export type OnCallback = (context: Utils.ComponentContext) => Promise<any>;

export interface ConfirmationOptions {
	onConfirm: OnCallback;
	onCancel: OnCallback;
  onAskingMessage: string;
	onTimeout?: Utils.ComponentOnTimeout;
	timeout?: number;
}

export class Confirmation {
	public components: Components;
	public context: Command.Context | Interaction.InteractionContext;
	public onConfirm: OnCallback;
	public onCancel: OnCallback;
    public onAskingMessage: string;
	public onTimeout?: Utils.ComponentOnTimeout;
	public timeout?: number;

	public constructor(
		context: Command.Context | Interaction.InteractionContext,
		options: ConfirmationOptions
	) {
		this.context = context;
		this.onConfirm = options.onConfirm;
		this.onCancel = options.onCancel;
    this.onAskingMessage = options.onAskingMessage;
		this.onTimeout = options.onTimeout ?? (() => undefined);
		this.timeout = options.timeout ?? 7500;

		this.components = new Components({
			timeout: this.timeout,
			onTimeout: this.onTimeout,
			run: this.onPress.bind(this),
		})
	}

	public onPress: Utils.ComponentRun = async (context) => {
		if (context.userId !== this.context.userId)
			return context.createMessage({
				content: 'No puedes usar esto',
				flags: MessageFlags.EPHEMERAL,
			});

		if (context.customId === 'confirmation_execute') {
			return this.onConfirm(context);
		}
		return this.onCancel(context);
	};

	public start() {
		const buttons = [
			{
				emoji: DiscordEmojis.CONFIRM,
				style: MessageComponentButtonStyles.SUCCESS,
				customId: 'confirmation_execute',
			},
			{
				emoji: DiscordEmojis.RETURN,
				style: MessageComponentButtonStyles.DANGER,
				customId: 'confirmation_cancel',
			},
		];

		for (const button of buttons) {
			this.components.createButton(button);
		}

		return (this.context as Command.Context).editOrReply({ embeds: [new Embed().setDescription(this.onAskingMessage).setFooter('Tienes 10 segundos.').setColor(EmbedColors.BLANK)], components: this.components});
	}
}