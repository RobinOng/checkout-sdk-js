import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, empty, of, from } from 'rxjs';
import { catchError, map, switchMapTo, switchMap } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../../checkout';
import { throwErrorAction } from '../../common/error';
import { MissingDataError, MissingDataErrorType } from '../../common/error/errors';

import GoogleRecaptcha from './google-recaptcha';
import { SpamProtectionAction, SpamProtectionActionType } from './spam-protection-actions';
import { SpamProtectionOptions } from './spam-protection-options';
import SpamProtectionRequestSender from './spam-protection-request-sender';

export default class SpamProtectionActionCreator {
    constructor(
        private _googleRecaptcha: GoogleRecaptcha,
        private _spamProtectionRequestSender: SpamProtectionRequestSender
    ) {}

    initialize({ containerId }: SpamProtectionOptions): ThunkAction<SpamProtectionAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const storeConfig = state.config.getStoreConfig();

            if (!storeConfig) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }

            const { isSpamProtectionEnabled, googleRecaptchaSitekey } = storeConfig.checkoutSettings;

            if (!isSpamProtectionEnabled) {
                return empty();
            }

            return concat(
                of(createAction(SpamProtectionActionType.InitializeRequested)),
                defer(() => this._googleRecaptcha.load(containerId, googleRecaptchaSitekey))
                    .pipe(
                        switchMapTo(this._googleRecaptcha.execute()),
                        map(recaptchaResult => {
                            if (!recaptchaResult.token) {
                                throw new Error('Spam protection not found.');
                            }

                            return this._spamProtectionRequestSender.validate(checkout.id, recaptchaResult.token);
                        }),
                        map(() => createAction(SpamProtectionActionType.InitializeSucceeded))
                    )
            ).pipe(
                catchError(error => throwErrorAction(SpamProtectionActionType.InitializeFailed, error))
            );
        };
    }

    validate(): ThunkAction<SpamProtectionAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const storeConfig = state.config.getStoreConfig();

            if (!storeConfig) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }

            const { isSpamProtectionEnabled, googleRecaptchaSitekey } = storeConfig.checkoutSettings;

            if (!isSpamProtectionEnabled) {
                return empty();
            }

            return concat(
                of(createAction(SpamProtectionActionType.InitializeRequested)),
                defer(() => this._googleRecaptcha.load(containerId, googleRecaptchaSitekey))
                    .pipe(
                        switchMapTo(this._googleRecaptcha.execute()),
                        map(recaptchaResult => {
                            if (!recaptchaResult.token) {
                                throw new Error('Spam protection not found.');
                            }

                            return this._spamProtectionRequestSender.validate(checkout.id, recaptchaResult.token);
                        }),
                        map(() => createAction(SpamProtectionActionType.InitializeSucceeded))
                    )
            ).pipe(
                catchError(error => throwErrorAction(SpamProtectionActionType.InitializeFailed, error))
            );
        };
    }
}
