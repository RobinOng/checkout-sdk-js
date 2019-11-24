import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout, CHECKOUT_DEFAULT_INCLUDES } from '../../checkout';
import { joinIncludes, ContentType } from '../../common/http-request';

export default class SpamProtectionRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    validate(checkoutId: string, spamProtectionToken: string): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/spam-protection`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, {
            headers,
            params: {
                include: joinIncludes(CHECKOUT_DEFAULT_INCLUDES),
            },
            body: {
                spamProtectionToken,
            },
        });
    }
}
