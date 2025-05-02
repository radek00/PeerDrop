import { ReactiveController, ReactiveControllerHost } from "lit";

export type ConfirmDialogRevealResult<ConfirmData, CancelData> =
  | {
      data?: ConfirmData;
      isCanceled: false;
    }
  | {
      data?: CancelData;
      isCanceled: true;
    };

export interface DialogContent {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export enum DialogType {
  CONFIRM,
  ALERT,
}

export class ConfirmDialogController<CancelData, ConfirmData> {
  host: ReactiveControllerHost;

  isRevealed = false;
  dialogContent?: DialogContent;
  dialogType?: DialogType;

  private _resolvePromise?: (
    result: ConfirmDialogRevealResult<any, any>
  ) => void;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this as ReactiveController);
  }

  reveal(
    dialogContent?: DialogContent,
    dialogType?: DialogType
  ): Promise<ConfirmDialogRevealResult<ConfirmData, CancelData>> {
    console.log("Revealing dialog...");
    this.dialogContent = dialogContent;
    this.dialogType = dialogType;
    this.isRevealed = true;
    this.host.requestUpdate();

    return new Promise<ConfirmDialogRevealResult<ConfirmData, CancelData>>(
      (resolve) => {
        this._resolvePromise = resolve as (
          result: ConfirmDialogRevealResult<ConfirmData, CancelData>
        ) => void;
      }
    );
  }

  confirm(data?: ConfirmData): void {
    if (!this.isRevealed || !this._resolvePromise) return;
    this.isRevealed = false;
    this.dialogContent = undefined;
    this.dialogType = undefined;
    this.host.requestUpdate();
    this._resolvePromise({ data, isCanceled: false });
  }

  cancel(data?: CancelData): void {
    if (!this.isRevealed || !this._resolvePromise) return;
    this.isRevealed = false;
    this.dialogContent = undefined;
    this.dialogType = undefined;
    this.host.requestUpdate();
    this._resolvePromise?.({ data, isCanceled: true });
  }
}
