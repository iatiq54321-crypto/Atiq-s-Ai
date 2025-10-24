/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  Bot,
  SendHorizontal,
  User,
} from 'lucide-react';

const defaultProps = {
  strokeWidth: 1.5,
};

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <User {...defaultProps} {...props} />
);

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Bot {...defaultProps} {...props} />
);

export const SendHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <SendHorizontal {...defaultProps} {...props} />;