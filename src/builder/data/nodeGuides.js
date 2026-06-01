/**
 * nodeGuides.js — короткие практические инструкции «Как использовать узел».
 *
 * Это НЕ контент Atlas (тот живёт в локалях nodes.json и открывается
 * кнопкой «Узнать больше в Atlas»). Здесь — микро-урок «что делает этот узел
 * в схеме и как его применить», в стиле обучения: очень коротко и понятно.
 *
 * Структура одного гайда (на каждую локаль ru/en/fi):
 *  • summary — 1 предложение: что узел делает в потоке
 *  • steps   — 2–4 коротких шага, как применить
 *  • tip     — один практический совет / частая ошибка
 *
 * Ключ верхнего уровня = defId из NODE_DEFS (nodeTypes.js).
 *
 * Используется компонентом NodeGuidePanel (правая панель) и кнопкой
 * «Как использовать» в ConceptTooltip / NodeDetails.
 *
 * getNodeGuide(defId, locale) → гайд для локали с fallback на 'ru'.
 */

const G = {
  /* ────────── Agents ────────── */
  'agent-main': {
    ru: {
      summary: 'Главный исполнитель: получает задачу и выполняет её по вашей инструкции.',
      steps: [
        'Перетащите узел на холст и кликните по нему.',
        'В окне справа напишите инструкцию: кто агент и что он должен сделать.',
        'Соедините вход (сверху) с предыдущим шагом, выход (снизу) — со следующим.',
      ],
      tip: 'Чем конкретнее инструкция, тем стабильнее результат. Пишите как для нового сотрудника.',
    },
    en: {
      summary: 'The main worker: takes a task and does it following your instruction.',
      steps: [
        'Drag the node onto the canvas and click it.',
        'In the right panel write the instruction: who the agent is and what to do.',
        'Connect the top input to the previous step, the bottom output to the next.',
      ],
      tip: 'The more specific the instruction, the more stable the result. Write it like for a new hire.',
    },
    fi: {
      summary: 'Pääsuorittaja: ottaa tehtävän ja tekee sen ohjeesi mukaan.',
      steps: [
        'Vedä solmu kankaalle ja napsauta sitä.',
        'Kirjoita oikealle ohje: kuka agentti on ja mitä sen pitää tehdä.',
        'Yhdistä ylätulo edelliseen vaiheeseen, alalähtö seuraavaan.',
      ],
      tip: 'Mitä tarkempi ohje, sitä vakaampi tulos. Kirjoita kuin uudelle työntekijälle.',
    },
  },
  'agent-research': {
    ru: {
      summary: 'Агент-исследователь: ищет и собирает информацию по теме.',
      steps: [
        'Кликните и опишите, что именно нужно найти и в каком виде вернуть.',
        'Подключите рядом инструмент «Веб-поиск», чтобы он смотрел реальные страницы.',
        'Выход направьте в агента-аналитика или сразу в доставку.',
      ],
      tip: 'Просите вернуть результат списком с источниками — так легче проверить.',
    },
    en: {
      summary: 'Research agent: searches and gathers information on a topic.',
      steps: [
        'Click and describe exactly what to find and in what form to return it.',
        'Attach the «Web search» tool nearby so it reads real pages.',
        'Send its output to an analyst agent or straight to delivery.',
      ],
      tip: 'Ask for a list with sources — it is easier to verify.',
    },
    fi: {
      summary: 'Tutkimusagentti: etsii ja kerää tietoa aiheesta.',
      steps: [
        'Napsauta ja kuvaa tarkasti, mitä etsiä ja missä muodossa palauttaa.',
        'Liitä viereen «Verkkohaku»-työkalu, jotta se lukee oikeita sivuja.',
        'Ohjaa tulos analyytikkoagentille tai suoraan toimitukseen.',
      ],
      tip: 'Pyydä lista lähteineen — sitä on helpompi tarkistaa.',
    },
  },
  'agent-ux': {
    ru: {
      summary: 'Агент по интерфейсам: оценивает удобство и предлагает улучшения.',
      steps: [
        'Кликните и опишите экран или сценарий, который нужно проверить.',
        'При необходимости подключите «Зрение», чтобы он смотрел на скриншот.',
        'Выход — в отчёт или агента, который соберёт итог.',
      ],
      tip: 'Просите конкретные правки с приоритетом, а не общие фразы «сделать красиво».',
    },
    en: {
      summary: 'UX agent: assesses usability and suggests improvements.',
      steps: [
        'Click and describe the screen or flow to review.',
        'Optionally attach «Vision» so it can look at a screenshot.',
        'Send the output to a report or an agent that compiles the summary.',
      ],
      tip: 'Ask for concrete prioritized fixes, not vague «make it nice».',
    },
    fi: {
      summary: 'UX-agentti: arvioi käytettävyyttä ja ehdottaa parannuksia.',
      steps: [
        'Napsauta ja kuvaa tarkistettava näkymä tai kulku.',
        'Liitä tarvittaessa «Näkö», jotta se voi katsoa kuvakaappausta.',
        'Ohjaa tulos raporttiin tai yhteenvedon kokoavalle agentille.',
      ],
      tip: 'Pyydä konkreettisia priorisoituja korjauksia, ei «tee kauniiksi».',
    },
  },
  'agent-analytics': {
    ru: {
      summary: 'Агент-аналитик: превращает данные и тексты в выводы.',
      steps: [
        'Кликните и укажите, какой вопрос данные должны закрыть.',
        'Подайте ему на вход результат поиска, файла или другого агента.',
        'Попросите вернуть выводы + рекомендации, а не пересказ.',
      ],
      tip: 'Задайте формат вывода (3 вывода, 3 действия) — ответ будет применимым.',
    },
    en: {
      summary: 'Analyst agent: turns data and texts into conclusions.',
      steps: [
        'Click and state which question the data should answer.',
        'Feed it the output of search, a file, or another agent.',
        'Ask for conclusions + recommendations, not a retelling.',
      ],
      tip: 'Fix the output format (3 findings, 3 actions) so the answer is actionable.',
    },
    fi: {
      summary: 'Analyytikkoagentti: muuttaa datan ja tekstit johtopäätöksiksi.',
      steps: [
        'Napsauta ja kerro, mihin kysymykseen datan pitää vastata.',
        'Syötä sille haun, tiedoston tai toisen agentin tulos.',
        'Pyydä johtopäätökset + suositukset, ei toistoa.',
      ],
      tip: 'Määritä tulosmuoto (3 havaintoa, 3 toimenpidettä), niin vastaus on käyttökelpoinen.',
    },
  },
  'agent-code': {
    ru: {
      summary: 'Агент-программист: пишет и объясняет код по задаче.',
      steps: [
        'Кликните и опишите задачу: язык, что на входе, что должно получиться.',
        'Дайте пример входных данных, если они есть.',
        'Выход направьте в проверку или доставку.',
      ],
      tip: 'Указывайте версию языка/библиотеки — иначе код может не подойти.',
    },
    en: {
      summary: 'Coder agent: writes and explains code for a task.',
      steps: [
        'Click and describe the task: language, input, expected output.',
        'Provide a sample input if you have one.',
        'Route the output to review or delivery.',
      ],
      tip: 'State the language/library version — otherwise the code may not fit.',
    },
    fi: {
      summary: 'Koodariagentti: kirjoittaa ja selittää koodia tehtävään.',
      steps: [
        'Napsauta ja kuvaa tehtävä: kieli, syöte, odotettu tulos.',
        'Anna esimerkkisyöte, jos sellainen on.',
        'Ohjaa tulos tarkistukseen tai toimitukseen.',
      ],
      tip: 'Kerro kielen/kirjaston versio — muuten koodi ei välttämättä sovi.',
    },
  },
  'agent-designer': {
    ru: {
      summary: 'Агент-дизайнер: предлагает идеи оформления и тексты для них.',
      steps: [
        'Кликните и опишите задачу: что оформляем, для кого, тон.',
        'Дайте ограничения: бренд, цвета, длину.',
        'Выход — в контент-агента или на финальную сборку.',
      ],
      tip: 'Один запрос — одна цель. Не смешивайте лого, баннер и пост в одном.',
    },
    en: {
      summary: 'Designer agent: proposes design ideas and the copy for them.',
      steps: [
        'Click and describe the task: what to design, for whom, the tone.',
        'Give constraints: brand, colors, length.',
        'Send the output to a content agent or final assembly.',
      ],
      tip: 'One request — one goal. Do not mix logo, banner and post in one.',
    },
    fi: {
      summary: 'Suunnitteluagentti: ehdottaa ilmeideoita ja niiden tekstit.',
      steps: [
        'Napsauta ja kuvaa tehtävä: mitä suunnitellaan, kenelle, sävy.',
        'Anna rajoitteet: brändi, värit, pituus.',
        'Ohjaa tulos sisältöagentille tai loppukokoonpanoon.',
      ],
      tip: 'Yksi pyyntö — yksi tavoite. Älä sekoita logoa, banneria ja julkaisua.',
    },
  },
  'agent-pm': {
    ru: {
      summary: 'Агент-менеджер: раскладывает задачу на план и шаги.',
      steps: [
        'Кликните и опишите цель и сроки.',
        'Попросите вернуть план шагами с ответственными.',
        'Выход можно отправить в календарь или доставку.',
      ],
      tip: 'Просите приоритеты — иначе получите длинный список без фокуса.',
    },
    en: {
      summary: 'PM agent: breaks a task into a plan and steps.',
      steps: [
        'Click and describe the goal and deadlines.',
        'Ask for a step-by-step plan with owners.',
        'The output can go to calendar or delivery.',
      ],
      tip: 'Ask for priorities — otherwise you get a long list without focus.',
    },
    fi: {
      summary: 'PM-agentti: pilkkoo tehtävän suunnitelmaksi ja vaiheiksi.',
      steps: [
        'Napsauta ja kuvaa tavoite ja aikataulu.',
        'Pyydä vaiheittainen suunnitelma vastuuhenkilöineen.',
        'Tuloksen voi ohjata kalenteriin tai toimitukseen.',
      ],
      tip: 'Pyydä prioriteetit — muuten saat pitkän listan ilman fokusta.',
    },
  },
  'agent-content': {
    ru: {
      summary: 'Контент-агент: пишет тексты — посты, письма, описания.',
      steps: [
        'Кликните и укажите формат, аудиторию и длину.',
        'Дайте факты или результат исследования на вход.',
        'Выход — в редактуру (цикл) или сразу в доставку.',
      ],
      tip: 'Задайте тон и пример — стиль текста станет предсказуемым.',
    },
    en: {
      summary: 'Content agent: writes texts — posts, emails, descriptions.',
      steps: [
        'Click and set the format, audience and length.',
        'Feed it facts or research results as input.',
        'Send output to editing (loop) or straight to delivery.',
      ],
      tip: 'Set the tone and an example — the style becomes predictable.',
    },
    fi: {
      summary: 'Sisältöagentti: kirjoittaa tekstejä — julkaisut, viestit, kuvaukset.',
      steps: [
        'Napsauta ja aseta muoto, yleisö ja pituus.',
        'Syötä faktat tai tutkimustulokset.',
        'Ohjaa tulos editointiin (silmukka) tai suoraan toimitukseen.',
      ],
      tip: 'Aseta sävy ja esimerkki — tyylistä tulee ennustettava.',
    },
  },

  /* ────────── Tools ────────── */
  'tool-search': {
    ru: {
      summary: 'Веб-поиск: даёт агенту доступ к реальным страницам в интернете.',
      steps: [
        'Перетащите рядом с агентом и соедините с ним.',
        'Ничего настраивать не нужно — агент сам решит, что искать.',
        'В инструкции агента попросите опираться на найденное.',
      ],
      tip: 'Полезно для свежих данных. Для сайтов на JavaScript результат может быть неполным.',
    },
    en: {
      summary: 'Web search: gives the agent access to real pages on the internet.',
      steps: [
        'Drag it next to an agent and connect them.',
        'Nothing to configure — the agent decides what to search.',
        'In the agent instruction, ask it to rely on what it finds.',
      ],
      tip: 'Great for fresh data. For JavaScript-heavy sites the result may be incomplete.',
    },
    fi: {
      summary: 'Verkkohaku: antaa agentille pääsyn oikeille verkkosivuille.',
      steps: [
        'Vedä se agentin viereen ja yhdistä.',
        'Mitään ei tarvitse säätää — agentti päättää, mitä hakea.',
        'Pyydä agentin ohjeessa nojaamaan löydettyyn.',
      ],
      tip: 'Hyvä tuoreelle tiedolle. JavaScript-sivuilla tulos voi jäädä vajaaksi.',
    },
  },
  'tool-file': {
    ru: {
      summary: 'Файлы: передаёт агенту ваш текст или документ для работы.',
      steps: [
        'Кликните по узлу и вставьте/загрузите текст.',
        'Соедините узел с агентом, который должен его прочитать.',
        'В инструкции агента сошлитесь на содержимое файла.',
      ],
      tip: 'Лучше работает с текстом. Очень большие документы стоит сократить заранее.',
    },
    en: {
      summary: 'Files: passes your text or document to the agent to work on.',
      steps: [
        'Click the node and paste/upload the text.',
        'Connect the node to the agent that should read it.',
        'In the agent instruction, refer to the file content.',
      ],
      tip: 'Works best with text. Very large documents are better trimmed first.',
    },
    fi: {
      summary: 'Tiedostot: välittää tekstisi tai asiakirjasi agentin käsiteltäväksi.',
      steps: [
        'Napsauta solmua ja liitä/lataa teksti.',
        'Yhdistä solmu agenttiin, jonka pitää lukea se.',
        'Viittaa agentin ohjeessa tiedoston sisältöön.',
      ],
      tip: 'Toimii parhaiten tekstillä. Suuret asiakirjat kannattaa lyhentää ensin.',
    },
  },
  'tool-vision': {
    ru: {
      summary: 'Зрение: позволяет агенту «увидеть» изображение или скриншот.',
      steps: [
        'Кликните и загрузите картинку.',
        'Соедините с агентом, который должен её разобрать.',
        'Попросите агента описать или проверить то, что на картинке.',
      ],
      tip: 'Хорошо для скриншотов, схем, фото. Мелкий текст распознаётся хуже.',
    },
    en: {
      summary: 'Vision: lets the agent «see» an image or screenshot.',
      steps: [
        'Click and upload the picture.',
        'Connect it to the agent that should analyze it.',
        'Ask the agent to describe or check what is in the image.',
      ],
      tip: 'Good for screenshots, diagrams, photos. Tiny text reads worse.',
    },
    fi: {
      summary: 'Näkö: antaa agentin «nähdä» kuvan tai kuvakaappauksen.',
      steps: [
        'Napsauta ja lataa kuva.',
        'Yhdistä se agenttiin, jonka pitää analysoida se.',
        'Pyydä agenttia kuvaamaan tai tarkistamaan kuvan sisältö.',
      ],
      tip: 'Hyvä kuvakaappauksiin, kaavioihin, valokuviin. Pieni teksti tunnistuu heikommin.',
    },
  },
  'tool-memory': {
    ru: {
      summary: 'Память: агент помнит предыдущие шаги и не теряет контекст.',
      steps: [
        'Перетащите рядом с агентом и соедините.',
        'Ничего вводить не нужно — память накапливается во время запуска.',
        'Полезно в цепочках, где поздний шаг ссылается на ранний.',
      ],
      tip: 'Не заменяет файл: память живёт в рамках одного запуска, не вечно.',
    },
    en: {
      summary: 'Memory: the agent remembers earlier steps and keeps context.',
      steps: [
        'Drag it next to an agent and connect.',
        'Nothing to type — memory builds up during the run.',
        'Useful in chains where a late step refers to an early one.',
      ],
      tip: 'Not a replacement for a file: memory lives within one run, not forever.',
    },
    fi: {
      summary: 'Muisti: agentti muistaa aiemmat vaiheet ja säilyttää kontekstin.',
      steps: [
        'Vedä se agentin viereen ja yhdistä.',
        'Mitään ei tarvitse kirjoittaa — muisti kertyy ajon aikana.',
        'Hyödyllinen ketjuissa, joissa myöhäinen vaihe viittaa aiempaan.',
      ],
      tip: 'Ei korvaa tiedostoa: muisti elää yhden ajon ajan, ei ikuisesti.',
    },
  },
  'tool-code-exec': {
    ru: {
      summary: 'Запуск кода: агент может выполнять вычисления и проверять код.',
      steps: [
        'Перетащите рядом с агентом-программистом и соедините.',
        'В инструкции агента попросите проверить результат запуском.',
        'Выход используйте дальше в потоке.',
      ],
      tip: 'Хорошо для математики и проверки логики, а не для доступа в интернет.',
    },
    en: {
      summary: 'Code execution: the agent can run calculations and test code.',
      steps: [
        'Drag it next to a coder agent and connect.',
        'In the agent instruction, ask it to verify the result by running.',
        'Use the output further down the flow.',
      ],
      tip: 'Good for math and logic checks, not for internet access.',
    },
    fi: {
      summary: 'Koodin ajo: agentti voi suorittaa laskelmia ja testata koodia.',
      steps: [
        'Vedä se koodariagentin viereen ja yhdistä.',
        'Pyydä agentin ohjeessa varmistamaan tulos ajamalla.',
        'Käytä tulosta eteenpäin virtauksessa.',
      ],
      tip: 'Hyvä matematiikkaan ja logiikan tarkistuksiin, ei verkkoyhteyteen.',
    },
  },
  'tool-computer': {
    ru: {
      summary: 'Управление компьютером: агент действует в интерфейсе как человек.',
      steps: [
        'Перетащите рядом с агентом и соедините.',
        'Опишите в инструкции, какие действия нужно выполнить.',
        'Используйте осторожно — это мощный, но рискованный инструмент.',
      ],
      tip: 'Это продвинутая возможность. Начинайте с простых, безопасных сценариев.',
    },
    en: {
      summary: 'Computer use: the agent acts in an interface like a person.',
      steps: [
        'Drag it next to an agent and connect.',
        'Describe in the instruction which actions to perform.',
        'Use carefully — a powerful but risky tool.',
      ],
      tip: 'An advanced capability. Start with simple, safe scenarios.',
    },
    fi: {
      summary: 'Tietokoneen käyttö: agentti toimii käyttöliittymässä kuin ihminen.',
      steps: [
        'Vedä se agentin viereen ja yhdistä.',
        'Kuvaa ohjeessa, mitkä toiminnot suoritetaan.',
        'Käytä varoen — tehokas mutta riskialtis työkalu.',
      ],
      tip: 'Edistynyt ominaisuus. Aloita yksinkertaisista, turvallisista skenaarioista.',
    },
  },
  'tool-citations': {
    ru: {
      summary: 'Цитаты: агент возвращает ответ со ссылками на источники.',
      steps: [
        'Перетащите рядом с агентом, который работает с текстами.',
        'Соедините — ничего настраивать не нужно.',
        'В инструкции попросите подкреплять выводы цитатами.',
      ],
      tip: 'Удобно, когда важна проверяемость: видно, откуда взят факт.',
    },
    en: {
      summary: 'Citations: the agent returns an answer with links to sources.',
      steps: [
        'Drag it next to an agent that works with texts.',
        'Connect — nothing to configure.',
        'In the instruction, ask it to back conclusions with citations.',
      ],
      tip: 'Handy when verifiability matters: you see where a fact came from.',
    },
    fi: {
      summary: 'Lähdeviitteet: agentti palauttaa vastauksen lähdelinkkeineen.',
      steps: [
        'Vedä se tekstien kanssa työskentelevän agentin viereen.',
        'Yhdistä — mitään ei tarvitse säätää.',
        'Pyydä ohjeessa tukemaan johtopäätökset viitteillä.',
      ],
      tip: 'Kätevä, kun todennettavuus on tärkeää: näet, mistä fakta tulee.',
    },
  },
  'tool-mcp': {
    ru: {
      summary: 'MCP-коннектор: подключает агента к вашим внешним сервисам.',
      steps: [
        'Сначала добавьте сервер в разделе «Ключи» → вкладка «MCP-серверы».',
        'Перетащите узел рядом с агентом и соедините.',
        'Кликните по узлу и отметьте, какие серверы дать этому агенту.',
      ],
      tip: 'Ничего не отметили — агент получит все ваши серверы. Отметили — только выбранные.',
    },
    en: {
      summary: 'MCP connector: links the agent to your external services.',
      steps: [
        'First add a server under «Keys» → «MCP servers» tab.',
        'Drag the node next to an agent and connect.',
        'Click the node and pick which servers this agent gets.',
      ],
      tip: 'Pick none — the agent gets all your servers. Pick some — only those.',
    },
    fi: {
      summary: 'MCP-liitin: yhdistää agentin ulkoisiin palveluihisi.',
      steps: [
        'Lisää ensin palvelin kohdassa «Avaimet» → «MCP-palvelimet».',
        'Vedä solmu agentin viereen ja yhdistä.',
        'Napsauta solmua ja valitse, mitkä palvelimet agentti saa.',
      ],
      tip: 'Et valinnut — agentti saa kaikki palvelimesi. Valitsit — vain ne.',
    },
  },

  /* ────────── Logic ────────── */
  'logic-condition': {
    ru: {
      summary: 'Условие: делит поток на две ветки — «Да» и «Нет».',
      steps: [
        'Кликните и задайте правило проверки (например, содержит ли слово).',
        'От выхода «Да» ведите одну ветку, от «Нет» — другую.',
        'Так разные случаи идут по разным путям.',
      ],
      tip: 'Связь рисуйте именно от нужного выхода (зелёный — Да, серый — Нет).',
    },
    en: {
      summary: 'Condition: splits the flow into two branches — «Yes» and «No».',
      steps: [
        'Click and set the check rule (e.g. whether it contains a word).',
        'Lead one branch from the «Yes» output, another from «No».',
        'Different cases then follow different paths.',
      ],
      tip: 'Draw the link from the right output (green — Yes, gray — No).',
    },
    fi: {
      summary: 'Ehto: jakaa virtauksen kahteen haaraan — «Kyllä» ja «Ei».',
      steps: [
        'Napsauta ja aseta tarkistussääntö (esim. sisältääkö sanan).',
        'Vie yksi haara «Kyllä»-lähdöstä, toinen «Ei»-lähdöstä.',
        'Eri tapaukset kulkevat eri polkuja.',
      ],
      tip: 'Piirrä yhteys oikeasta lähdöstä (vihreä — Kyllä, harmaa — Ei).',
    },
  },
  'logic-condition-agent': {
    ru: {
      summary: 'Умное условие: агент сам решает, по какой ветке пойти.',
      steps: [
        'Кликните и опишите словами, как принять решение.',
        'Подключите ветки «Да» и «Нет» к разным шагам.',
        'Используйте, когда правило сложно описать формулой.',
      ],
      tip: 'Формулируйте критерий чётко: «если жалоба — Да, иначе — Нет».',
    },
    en: {
      summary: 'Smart condition: the agent itself decides which branch to take.',
      steps: [
        'Click and describe in words how to make the decision.',
        'Connect «Yes» and «No» branches to different steps.',
        'Use it when a rule is hard to express as a formula.',
      ],
      tip: 'State the criterion clearly: «if complaint — Yes, else — No».',
    },
    fi: {
      summary: 'Älykäs ehto: agentti päättää itse, kumpaa haaraa kuljetaan.',
      steps: [
        'Napsauta ja kuvaa sanoin, miten päätös tehdään.',
        'Yhdistä «Kyllä»- ja «Ei»-haarat eri vaiheisiin.',
        'Käytä, kun sääntöä on vaikea ilmaista kaavalla.',
      ],
      tip: 'Muotoile kriteeri selkeästi: «jos valitus — Kyllä, muuten — Ei».',
    },
  },
  'logic-loop': {
    ru: {
      summary: 'Цикл: повторяет шаг несколько раз, чтобы улучшить результат.',
      steps: [
        'Кликните и выберите, к какому узлу вернуться и сколько раз.',
        'Поставьте цикл после агента, чей результат надо дорабатывать.',
        'Например: написал текст → проверил → переписал.',
      ],
      tip: 'Ставьте разумный лимит повторов — иначе запуск затянется и подорожает.',
    },
    en: {
      summary: 'Loop: repeats a step several times to improve the result.',
      steps: [
        'Click and choose which node to return to and how many times.',
        'Place the loop after the agent whose output needs refining.',
        'For example: wrote text → checked → rewrote.',
      ],
      tip: 'Set a sensible repeat limit — otherwise the run drags on and costs more.',
    },
    fi: {
      summary: 'Silmukka: toistaa vaiheen useita kertoja tuloksen parantamiseksi.',
      steps: [
        'Napsauta ja valitse, mihin solmuun palataan ja montako kertaa.',
        'Sijoita silmukka sen agentin jälkeen, jonka tulosta hiotaan.',
        'Esimerkiksi: kirjoitti tekstin → tarkisti → kirjoitti uudelleen.',
      ],
      tip: 'Aseta järkevä toistoraja — muuten ajo venyy ja kallistuu.',
    },
  },

  /* ────────── Flow ────────── */
  'trigger-input': {
    ru: {
      summary: 'Старт: точка входа потока, сюда вы пишете задачу.',
      steps: [
        'Это первый узел — от него начинается вся схема.',
        'Кликните и впишите задачу или включите запуск по расписанию.',
        'Соедините его выход с первым агентом.',
      ],
      tip: 'Можно использовать переменные {{вот_так}}, чтобы менять задачу без правки схемы.',
    },
    en: {
      summary: 'Start: the entry point of the flow, where you write the task.',
      steps: [
        'This is the first node — the whole schema starts here.',
        'Click and type the task, or enable scheduled runs.',
        'Connect its output to the first agent.',
      ],
      tip: 'Use variables {{like_this}} to change the task without editing the schema.',
    },
    fi: {
      summary: 'Aloitus: virtauksen aloituspiste, johon kirjoitat tehtävän.',
      steps: [
        'Tämä on ensimmäinen solmu — koko kaavio alkaa tästä.',
        'Napsauta ja kirjoita tehtävä tai ota ajastettu ajo käyttöön.',
        'Yhdistä sen lähtö ensimmäiseen agenttiin.',
      ],
      tip: 'Käytä muuttujia {{näin}}, jotta voit vaihtaa tehtävän ilman kaavion muokkausta.',
    },
  },
  'output-text': {
    ru: {
      summary: 'Результат-текст: показывает итог потока на экране.',
      steps: [
        'Поставьте в конце схемы.',
        'Соедините вход с последним агентом.',
        'После запуска результат появится в панели и его можно скопировать.',
      ],
      tip: 'Это самый простой вывод — удобно для проверки, пока настраиваете поток.',
    },
    en: {
      summary: 'Text result: shows the flow output on screen.',
      steps: [
        'Place it at the end of the schema.',
        'Connect its input to the last agent.',
        'After a run the result appears in the panel and can be copied.',
      ],
      tip: 'The simplest output — handy for checking while you tune the flow.',
    },
    fi: {
      summary: 'Tekstitulos: näyttää virtauksen tuloksen ruudulla.',
      steps: [
        'Sijoita se kaavion loppuun.',
        'Yhdistä sen tulo viimeiseen agenttiin.',
        'Ajon jälkeen tulos näkyy paneelissa ja sen voi kopioida.',
      ],
      tip: 'Yksinkertaisin tulos — kätevä tarkistukseen virtausta säätäessä.',
    },
  },
  'output-telegram': {
    ru: {
      summary: 'Telegram: присылает результат вам в мессенджер.',
      steps: [
        'Подключите Telegram в разделе «Ключи».',
        'Кликните по узлу и укажите, в какой чат слать.',
        'Поставьте в конце ветки, результат которой хотите получать.',
      ],
      tip: 'Идеально для уведомлений по расписанию — приходит, даже когда сайт закрыт.',
    },
    en: {
      summary: 'Telegram: sends the result to your messenger.',
      steps: [
        'Connect Telegram under «Keys».',
        'Click the node and set which chat to send to.',
        'Place it at the end of the branch whose result you want.',
      ],
      tip: 'Perfect for scheduled alerts — arrives even when the site is closed.',
    },
    fi: {
      summary: 'Telegram: lähettää tuloksen viestisovellukseesi.',
      steps: [
        'Yhdistä Telegram kohdassa «Avaimet».',
        'Napsauta solmua ja aseta, mihin chattiin lähetetään.',
        'Sijoita se sen haaran loppuun, jonka tuloksen haluat.',
      ],
      tip: 'Täydellinen ajastettuihin ilmoituksiin — saapuu, vaikka sivu olisi kiinni.',
    },
  },
  'output-email': {
    ru: {
      summary: 'Email: отправляет результат на электронную почту.',
      steps: [
        'Подключите почтовый ключ в разделе «Ключи».',
        'Кликните по узлу и укажите адрес получателя и тему.',
        'Поставьте в конце нужной ветки.',
      ],
      tip: 'Хорошо для отчётов и черновиков, которые нужно сохранить в почте.',
    },
    en: {
      summary: 'Email: sends the result to an email address.',
      steps: [
        'Connect the email key under «Keys».',
        'Click the node and set the recipient address and subject.',
        'Place it at the end of the needed branch.',
      ],
      tip: 'Good for reports and drafts you want kept in your mailbox.',
    },
    fi: {
      summary: 'Sähköposti: lähettää tuloksen sähköpostiosoitteeseen.',
      steps: [
        'Yhdistä sähköpostiavain kohdassa «Avaimet».',
        'Napsauta solmua ja aseta vastaanottajan osoite ja aihe.',
        'Sijoita se tarvittavan haaran loppuun.',
      ],
      tip: 'Hyvä raportteihin ja luonnoksiin, jotka haluat säilyttää postissa.',
    },
  },
  'output-calendar': {
    ru: {
      summary: 'Календарь: создаёт события в вашем Google Календаре.',
      steps: [
        'Подключите Google Календарь в разделе «Ключи».',
        'Кликните по узлу и при необходимости выберите календарь.',
        'Поставьте после агента, который готовит события.',
      ],
      tip: 'Попросите агента вернуть дату, время и название — тогда событие создастся точно.',
    },
    en: {
      summary: 'Calendar: creates events in your Google Calendar.',
      steps: [
        'Connect Google Calendar under «Keys».',
        'Click the node and pick a calendar if needed.',
        'Place it after the agent that prepares events.',
      ],
      tip: 'Ask the agent to return date, time and title — then the event is created accurately.',
    },
    fi: {
      summary: 'Kalenteri: luo tapahtumia Google-kalenteriisi.',
      steps: [
        'Yhdistä Google-kalenteri kohdassa «Avaimet».',
        'Napsauta solmua ja valitse tarvittaessa kalenteri.',
        'Sijoita se tapahtumat valmistelevan agentin jälkeen.',
      ],
      tip: 'Pyydä agenttia palauttamaan päivä, aika ja otsikko — tapahtuma luodaan tarkasti.',
    },
  },
};

/**
 * Получить гайд для defId в нужной локали (fallback на 'ru').
 * @returns {{summary:string, steps:string[], tip:string} | null}
 */
export function getNodeGuide(defId, locale = 'ru') {
  const entry = G[defId];
  if (!entry) return null;
  return entry[locale] || entry.ru || null;
}

export const NODE_GUIDES = G;
