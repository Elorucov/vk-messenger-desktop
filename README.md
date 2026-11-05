> [!WARNING]
> Это исходный код десктопной версии [VK Мессенджера](https://vk.me/app), восстановленный благодаря файлам .map с помощью Claude и предоставленный как есть (только исправил пару багов, из-за которого контент не отображался в окне). На данный момент npm start запускает его в окружении prod и пока не знаю как заставить запустить как dev (ибо я не веб-разработчик). В файлах-компонентах вместо JSX используется функции `React.createElement` (ибо так они и хранились в .map-ах). Текст ниже полностью написан ИИ.

# VK Мессенджер — десктопный клиент

<img width="1920" height="1080" alt="Screenshot (619)" src="https://github.com/user-attachments/assets/6c79db05-bd13-4880-b5b8-4e03217ffddf" />

## Структура

```
packages/main         главный процесс (Electron)
packages/preload      preload-скрипты для окон (vkm / calls / media / regWebView)
packages/renderer     UI: четыре страницы (index, auth, calls, media)
packages/vkme-common  общие типы, каналы IPC и константы
packages/fonts        шрифты, на которые ссылаются стили из dist
packages/active-win   локальный форк active-win
vendor/               пакеты из внутреннего реестра VK
scripts/              вспомогательные скрипты сборки
```

## Требования

- Node.js 18 или 20+
- npm 9+

## Установка и сборка

```bash
npm install
npm run build
```

`npm run build` последовательно: скачивает языковые паки, собирает preload, renderer и main.

## Запуск

```bash
npm start
```

## Сборка дистрибутива

```bash
npm run compile        # инсталлятор для текущей платформы
npm run compile:dir    # распакованная сборка, без инсталлятора
```

## Переменные окружения

Лежат в `.env` (пример — `.env.example`):

| Переменная | Назначение |
| --- | --- |
| `VITE_BUILD_NUMBER` | номер сборки, попадает в «О программе» и в лог при старте |
| `VITE_APP_UPDATE_URL` | адрес фида автообновлений |
| `VITE_DEV_TOOLS_ALLOWED` | `true` — разрешает пункт DevTools в меню |

Версии приложения, веб-мессенджера и модуля звонков подставляются в бандлы
из `scripts/defines.mjs`.

## Прочее

- Языковые паки тянутся с `vk.com` при сборке (`npm run lang`). Если сети нет,
  используется снапшот из `packages/main/lang`.
- Проект собран как npm workspaces; пакеты из `vendor/` подключаются как
  локальные воркспейсы.
