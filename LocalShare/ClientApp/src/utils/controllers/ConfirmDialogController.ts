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

export class ConfirmDialogController<CancelData, ConfirmData> {
  host: ReactiveControllerHost;

  isRevealed = false;

  private _resolvePromise?: (
    result: ConfirmDialogRevealResult<any, any>
  ) => void;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this as ReactiveController);
  }

  reveal(): Promise<ConfirmDialogRevealResult<ConfirmData, CancelData>> {
    console.log("Revealing dialog...");
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
    this._resolvePromise({ data, isCanceled: false });
  }

  cancel(data?: CancelData): void {
    if (!this.isRevealed || !this._resolvePromise) return;
    this.isRevealed = false;
    this._resolvePromise?.({ data, isCanceled: true });
  }
}
