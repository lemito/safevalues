/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {SafeUrl, unwrapUrl} from '../../index';

/**
 * Sets the Formaction attribute from the given SafeUrl.
 */
export function setFormaction(button: HTMLButtonElement, url: SafeUrl) {
  button.formAction = unwrapUrl(url);
}
