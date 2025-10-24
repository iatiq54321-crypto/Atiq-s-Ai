/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  ArrowRight,
  Bot,
  ChevronDown,
  Film,
  Key,
  Layers,
  Library,
  Mic,
  Plus,
  RectangleHorizontal,
  RotateCw,
  SendHorizonal,
  SlidersHorizontal,
  Sparkles,
  StopCircle,
  Tv,
  Type,
  User,
  X,
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

export const SendHorizonalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <SendHorizonal {...defaultProps} {...props} />;

// FIX: Added all missing icons used across different components.
export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Key {...defaultProps} {...props} />
);

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowRight {...defaultProps} {...props} />;

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ChevronDown {...defaultProps} {...props} />;

export const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Film {...defaultProps} {...props} />
);

export const FramesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <RectangleHorizontal {...defaultProps} {...props} />;

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Plus {...defaultProps} {...props} />
);

export const RectangleStackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Layers {...defaultProps} {...props} />;

export const ReferencesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Library {...defaultProps} {...props} />;

export const SlidersHorizontalIcon: React.FC<
  React.SVGProps<SVGSVGElement>
> = (props) => <SlidersHorizontal {...defaultProps} {...props} />;

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Sparkles {...defaultProps} {...props} />
);

export const TextModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Type {...defaultProps} {...props} />
);

export const TvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Tv {...defaultProps} {...props} />
);

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <X {...defaultProps} {...props} />
);

export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <RotateCw {...defaultProps} {...props} />;

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Mic {...defaultProps} {...props} />
);

export const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <StopCircle {...defaultProps} {...props} />;
