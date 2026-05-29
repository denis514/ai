import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  // mindmap node icons
  BrainIcon,
  SlidersHorizontalIcon,
  MixerIcon,
  Setting07Icon,
  KeyboardIcon,
  FlashIcon,
  Link01Icon,
  Unlink01Icon,
  Edit01Icon,
  PencilIcon,
  SparklesIcon,
  QuestionIcon,
  Globe02Icon,
  FishingHookIcon,
  PaintBoardIcon,
  MaskTheater01Icon,
  Target02Icon,
  ConstructionIcon,
  Store01Icon,
  Tag01Icon,
  UserGroup02Icon,
  DeveloperIcon,
  LaptopIcon,
  Folder01Icon,
  File01Icon,
  Calendar01Icon,
  ChartBarLineIcon,
  ClipboardIcon,
  AttachmentIcon,
  Book01Icon,
  Books01Icon,
  ScrollIcon,
  Note01Icon,
  InboxIcon,
  CubeIcon,
  RepeatIcon,
  Plug01Icon,
  Search01Icon,
  LockKeyIcon,
  MicroscopeIcon,
  FolderLibraryIcon,
  Delete02Icon,
  ToolsIcon,
  Shield01Icon,
  Robot01Icon,
  PuzzleIcon,
  TestTubeIcon,
  CompassIcon,
  BrickWallIcon,
  CommandIcon,
  Rocket01Icon,
  FolderAddIcon,
  ComputerTerminal01Icon,
  Download01Icon,
  // UI control icons
  PlusSignIcon,
  MinusSignIcon,
  Cancel01Icon,
  Tick02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Mortarboard01Icon,
  ChampionIcon,
  Clock01Icon,
  Idea01Icon,
  Maximize01Icon,
  Minimize01Icon,
  BrowserIcon,
  SidebarBottomIcon,
  ArrowExpandDiagonal01Icon,
  ArrowShrink01Icon,
  FlowCircleIcon,
  Bookmark01Icon,
  BookmarkCheck01Icon,
  LinkSquare01Icon,
  EyeIcon,
  Building01Icon,
  QuoteDownIcon,
  UserCircleIcon,
  StarIcon,
  MoreHorizontalIcon,
  // node status badge icons
  CheckmarkCircle01Icon,
  CircleArrowReload01Icon,
  // auth icons
  Login01Icon,
  Mail01Icon,
  MailSend01Icon,
  Alert01Icon,
  InformationCircleIcon,
  // theme icons
  Sun03Icon,
  Moon02Icon
} from '@hugeicons/core-free-icons';

/**
 * Central icon registry. Maps semantic kebab-case names to Hugeicons components.
 * One swap point for the whole library: if we ever change icon vendor, only this file changes.
 *
 * Semantic name -> Hugeicons component.
 * Names are stable; underlying icon component may evolve.
 */
const REGISTRY = {
  // === mindmap nodes ===
  brain:        BrainIcon,
  sliders:      SlidersHorizontalIcon,    // 🎚️ levels
  mixer:        MixerIcon,                // 🎛️ controls
  settings:     Setting07Icon,            // ⚙️
  keyboard:     KeyboardIcon,             // ⌨️
  flash:        FlashIcon,                // ⚡
  link:         Link01Icon,               // ⛓️ chain
  unlink:       Unlink01Icon,             // ⛓️‍💥 разорванная цепь
  edit:         Edit01Icon,               // ✍️
  pencil:       PencilIcon,               // ✏️
  sparkles:     SparklesIcon,             // ✨ / ✦
  question:     QuestionIcon,             // ❓
  globe:        Globe02Icon,              // 🌍
  hook:         FishingHookIcon,          // 🎣
  paint:        PaintBoardIcon,           // 🎨
  mask:         MaskTheater01Icon,        // 🎭
  target:       Target02Icon,             // 🎯
  construction: ConstructionIcon,         // 🏗️
  store:        Store01Icon,              // 🏪
  tag:          Tag01Icon,                // 🏷️
  users:        UserGroup02Icon,          // 👥
  developer:    DeveloperIcon,            // 👨‍💻
  laptop:       LaptopIcon,               // 💻
  folder:       Folder01Icon,             // 📁
  file:         File01Icon,               // 📄
  calendar:     Calendar01Icon,           // 📅
  chart:        ChartBarLineIcon,         // 📊
  clipboard:    ClipboardIcon,            // 📋
  attachment:   AttachmentIcon,           // 📎
  book:         Book01Icon,               // 📘
  books:        Books01Icon,              // 📚
  scroll:       ScrollIcon,               // 📜
  note:         Note01Icon,               // 📝
  inbox:        InboxIcon,                // 📥
  cube:         CubeIcon,                 // 📦
  repeat:       RepeatIcon,               // 🔁
  plug:         Plug01Icon,               // 🔌
  search:       Search01Icon,             // 🔍 / 🔎
  lock:         LockKeyIcon,              // 🔐
  microscope:   MicroscopeIcon,           // 🔬
  archive:      FolderLibraryIcon,        // 🗂️
  trash:        Delete02Icon,             // 🗑️
  tools:        ToolsIcon,                // 🛠️
  shield:       Shield01Icon,             // 🛡️
  robot:        Robot01Icon,              // 🤖
  puzzle:       PuzzleIcon,               // 🧩
  testtube:     TestTubeIcon,             // 🧪
  compass:      CompassIcon,              // 🧭
  bricks:       BrickWallIcon,            // 🧱
  command:      CommandIcon,              // /
  rocket:       Rocket01Icon,             // 🚀
  'folder-plus': FolderAddIcon,           // 📁+
  terminal:     ComputerTerminal01Icon,   // >_
  download:     Download01Icon,           // ⬇

  // === UI controls ===
  plus:        PlusSignIcon,
  minus:       MinusSignIcon,
  close:       Cancel01Icon,
  check:       Tick02Icon,
  'arrow-right': ArrowRight01Icon,
  'arrow-left':  ArrowLeft01Icon,
  'arrow-down':  ArrowDown01Icon,
  'arrow-up':    ArrowUp01Icon,
  graduation:  Mortarboard01Icon,
  trophy:      ChampionIcon,
  clock:       Clock01Icon,
  idea:        Idea01Icon,
  expand:      Maximize01Icon,
  minimize:    Minimize01Icon,
  window:      BrowserIcon,                // ▢ открыть как отдельное окно
  dock:        SidebarBottomIcon,          // ▭ вернуть в док снизу
  fullscreen:  ArrowExpandDiagonal01Icon,  // ⤢ во весь экран
  restore:     ArrowShrink01Icon,          // ⤡ свернуть из полноэкрана
  branch:      FlowCircleIcon,             // ⌥ ветвление / условие
  bookmark:    Bookmark01Icon,
  'bookmark-filled': BookmarkCheck01Icon,
  'check-circle':    CheckmarkCircle01Icon,  // бейдж «просмотрено»
  'refresh-circle':  CircleArrowReload01Icon, // бейдж «вернуться»
  'external-link': LinkSquare01Icon,
  eye:         EyeIcon,
  building:    Building01Icon,
  quote:       QuoteDownIcon,
  user:        UserCircleIcon,
  star:        StarIcon,
  more:        MoreHorizontalIcon,
  // auth
  login:       Login01Icon,
  mail:        Mail01Icon,
  send:        MailSend01Icon,
  warning:     Alert01Icon,
  info:        InformationCircleIcon,
  // theme toggle
  sun:         Sun03Icon,
  moon:        Moon02Icon
};

/**
 * Icon component — single point of truth for all icons in the app.
 *
 * Usage:
 *   <Icon name="brain" />
 *   <Icon name="search" size={20} />
 *   <Icon name="check" size={14} strokeWidth={2} />
 *
 * Props:
 *   - name (string, required): semantic name from REGISTRY
 *   - size (number|string): default 20
 *   - strokeWidth (number): default 1.5
 *   - className, color, ...rest forwarded to HugeiconsIcon
 */
export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.5,
  className = '',
  ...rest
}) {
  const icon = REGISTRY[name];
  if (!icon) {
    if (typeof window !== 'undefined' && import.meta.env?.DEV) {
      console.warn(`[Icon] unknown name: "${name}"`);
    }
    return null;
  }
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={`icon ${className}`.trim()}
      {...rest}
    />
  );
}

export const ICON_NAMES = Object.keys(REGISTRY);
