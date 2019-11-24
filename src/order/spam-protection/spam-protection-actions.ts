import { Action } from '@bigcommerce/data-store';

export enum SpamProtectionActionType {
    InitializeFailed = 'SPAM_PROTECTION_INITIALIZE_FAILED',
    InitializeSucceeded = 'SPAM_PROTECTION_INITIALIZE_SUCCEEDED',
    InitializeRequested = 'SPAM_PROTECTION_INITIALIZE_REQUESTED',
}

export type SpamProtectionAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction;

export interface InitializeRequestedAction extends Action {
    type: SpamProtectionActionType.InitializeRequested;
}

export interface InitializeSucceededAction extends Action {
    type: SpamProtectionActionType.InitializeSucceeded;
}

export interface InitializeFailedAction extends Action<Error> {
    type: SpamProtectionActionType.InitializeFailed;
}
