// Реестр локалей: статический импорт JSON-словарей.
//
// Структура: ui.json содержит namespace-блоки (common, profile, header...)
// на верхнем уровне. nodes.json / tutorials.json содержат
// { [id]: { ... } } и регистрируются как отдельные namespace.
//
// При добавлении новой локали — импорт + регистрация в STRINGS.
import enUI from '../locales/en/ui.json';
import ruUI from '../locales/ru/ui.json';
import fiUI from '../locales/fi/ui.json';

import enNodes from '../locales/en/nodes.json';
import ruNodes from '../locales/ru/nodes.json';
import fiNodes from '../locales/fi/nodes.json';

import enTutorials from '../locales/en/tutorials.json';
import ruTutorials from '../locales/ru/tutorials.json';
import fiTutorials from '../locales/fi/tutorials.json';

import enPrompts from '../locales/en/prompts.json';
import ruPrompts from '../locales/ru/prompts.json';
import fiPrompts from '../locales/fi/prompts.json';

import enLibrary from '../locales/en/prompt-library.json';
import ruLibrary from '../locales/ru/prompt-library.json';
import fiLibrary from '../locales/fi/prompt-library.json';

import enPaths from '../locales/en/paths.json';
import ruPaths from '../locales/ru/paths.json';
import fiPaths from '../locales/fi/paths.json';

import enHelp from '../locales/en/help.json';
import ruHelp from '../locales/ru/help.json';
import fiHelp from '../locales/fi/help.json';

// Каждая локаль — плоский bag, доступный t() через dotted-путь.
// UI-блоки разворачиваются на верхний уровень; контентные коллекции —
// под собственными namespace-ключами.
export const STRINGS = {
  en: { ...enUI, nodes: enNodes, tutorials: enTutorials, prompts: enPrompts, 'prompt-library': enLibrary, paths: enPaths, help: enHelp },
  ru: { ...ruUI, nodes: ruNodes, tutorials: ruTutorials, prompts: ruPrompts, 'prompt-library': ruLibrary, paths: ruPaths, help: ruHelp },
  fi: { ...fiUI, nodes: fiNodes, tutorials: fiTutorials, prompts: fiPrompts, 'prompt-library': fiLibrary, paths: fiPaths, help: fiHelp }
};
