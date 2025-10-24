/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLanguageSelector?: boolean;
}