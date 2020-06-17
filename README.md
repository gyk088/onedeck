# ONEDECK (Микросервисный фронтенд)

##### Фреймворк ONEDECK позволяет легко писать микросервисы во фронтенде.
##### В рамках данного фреймворка микросервис для фронтенда называется модуль.

## Модуль (микросервис, фрагмент)

Модуль - независимая, логически законченная единица приложения.

- Может быть написан c помощью любого фреймворка ([Vue][vue], [React][react], [Angular][angular], [Webix][webix] ... );

- Можно легко собрать отдельно от всего приложения;

- Динамически импортируется;

## Виды модулей
Все модули, за исключением Root модуля наследуются от базового класса onedeck.Module.
Root модуль наследуется от базового класса onedeck.RootModule.

- **Root Module** Главный модуль приложения. Инициализируется один раз при старте приложения и инициализирует все модули приложения. Все модули общаются между собой через Root модуль с помощью событий. Реализует паттерн [Медиатор][mediator].
- **Page Module**  Модуль страницы. Инициализируется при переходе на страницу модуля. Каждый модуль страницы соответствует конкретному url адресу. Может встраиваться в модуль макета (Layout module) и содержать в себе встраиваемые модули (Embed Module)
- **Global Module**  Глобальный модуль (глобальные модульные окна, нотификации). Инициализируется один раз при старте приложения. Может вызываться из любой точки приложения. Может содержать в себе Embed модули.
- **Layout Module**  Модуль макета (header, footer).  Инициализируется при переходе на страницу, если еще не был проинициализирован на предыдущей странице. Представляет собой контейнер для встраивания Page модуля и для встраивания Embed модулей страницы.
- **Embed Module**  Встраиваемый модуль. Инициализируется при переходе на страницу модуля Page либо при инициализации Global модуля. Представляет собой логически законченную часть, которая может быть встроена в различные модули приложения.

## Пример внутреннего устройства
```
|--project_name_dir
    |--src
        |--modules
            |--Root
                |--root.js
                ...
            |--Module1
                |--module.js
                ...
            |--Module2
                |--module.js
                ...
            ...
```
Имя модуля начинается с заглавной буквы. Название директории модуля должно соответствовать названию модуля.

## Конфигурация приложения
При старте приложения происиходит инициализация модуля Root, который в свою очередь динамически импортирует необходимые модули и инициализирует их.

## Alias в webpack.config
Для того, чтобы пути в модуле были относительно модуля, следует прописать директиву [alias][alias] в `webpack.config`
 ```
 resolve: {
    alias: {
      ModuleName: path.resolve(__dirname, src/modules/ModuleName),
      ...
    }
  },
 ```

#### Можно автоматизировать данную процедуру ([alias][alias] в `webpack.config`):
```
const { readdirSync } = require('fs')

const modules = {}
try {
    readdirSync(path.resolve(__dirname, "src/modules/")).forEach(m => {
        modules[m] = path.resolve(__dirname, src/modules/${m})
        console.info(\x1b[37m Module: \x1b[33m ${m})
    })
} catch (e) {
    console.error('\x1b[31m', e.toString())
    process.exit()
}
module.exports = {
    .....
    resolve: {
        alias: modules
    }
  },
```
#### Старт приложения (index.js):
```
import Config from './conf';
new Config.rootModule(Config);
```

#### Конфиг файл
```
import Root from 'Root/module';

export default {
  // роутинг с помощю history Api или hash
  historyApi: false,
  // корневой путь для приложения ('/example/path/')
  rootPath: '/',
  // класс Root модуля
  rootModule: Root,
  // название модуля главной страницы
  mainModule: 'main',
  // названия модуля страницы 404
  module404: 'notfound',
  // функция для динамического импорта модуля
  // module - название модуля и название директории модуля
  import: async (module) => await import(./modules/${module}/module),
  modules: {
    auth: {
      module: 'ExampleAuth',
    },
    main: {
      layout: 'ExampleLayoutWebix',
      module: 'ExampleWebix',
      embed: {
        example: {
          module: 'ExampleEmbed',
        },
      },
    },
    notfound: {
      layout: 'ExampleLayoutWebix',
      module: 'ExampleError404',
    },
    globalwnd: {
      global: true,
      module: 'ExampleGlobalWnd',
      embed: {
        example: {
          module: 'ExampleEmbedGlobal',
        },
      },
    },
    globalnotification: {
      global: true,
      module: 'ExampleNotification',
    },
  },
};
```
Конфигурация может содержать любые поля, в зависимости от необходимости.
##### Обязательные поля конфигурации приложения
- `historyApi: Bool` - вид роутинга в приложении
-  `rootPath: String` - начальный роут. Если наше приложение стартует от пути `http://localhost:3000/example/path/`, в rootPath необходимо указать `/example/path/`;
-  `rootModule: Class` - класс Root модуля
-  `mainModule: String` - название модуля главной страницы
-  `module404: String` - название модуля страницы 404
-  `import: Function` - асинхронная функция, которая динамически импортирует все модули
-  `modules: Object` - объект, который содержит настройки всех модулей
##### Конфигурация модуля
```
main: {
  layout: 'ExampleLayoutWebix',
  module: 'ExampleWebix',
  embed: {
    example: {
      module: 'ExampleEmbed',
    },
  },
},
```

Конфигурация модуля может содержать любые поля, в зависимости от необходимости.
- **`ключ объекта конфигурации main`**- название модуля. Данное название соответсвует url модуля `http://localhost:3000/main/`
- `module: String` - Обязательное поле. Содержит название модуля. Модуль должен находиться в директории с соответствующим названием.
- `layout: String` - Необязательное поле. Содержит название модуля Layout. Модуль должен находиться в директории с соответствующим названием.
- `embed: Object` - Необязательное поле. Содержит Embed модули. Модуль должен находиться в директории с соответствующим названием, которое указано в поле  module .

## Пример Root модуля
```
import Onedeck from 'onedeck';
import ExampleNotification from 'ExampleNotification/module';
import ExampleGlobalWnd from 'ExampleGlobalWnd/module';

export default class Root extends Onedeck.RootModule {
  init (initObj) {
    console.log('init', this.constructor.name, initObj);
    this.eventHandler();
  }

  eventHandler () {
    this.$$on('examplEvent', (exampleData) => {
      this.exampleAction(exampleData);
    });

    this.$$on('showGlobalWnd', () => {
      const wnd = new ExampleGlobalWnd();
      wnd.show();
    });

    this.$$on('notify', (text) => {
      const notifyObj = new ExampleNotification();
      notifyObj.notify(text);
    });
  }

  dispatcher (path, state) {
    console.log('dispatcher', this.constructor.name, path, state);
  }

  mounted (module, layout) {
    console.log('mounted', this.constructor.name, module, layout);
  }
}
```
Root module - является ядром всего приложения

Модуль описывает следующие методы
- `init (initObj)` - инициализация Root модуля. При инициализации нужно вызвать метод `this.eventHandler();`
- `eventHandler ()` - в этом методе мы описываем все события уровня приложения (глобальные)
```
    this.$$on('examplEvent', (exampleData) => {
      this.exampleAction(exampleData);
    });
```
после этого объявления (`this.$$on`) в каждом модуле можно вызвать это событие  `module.$$gemit('examplEvent', data)`
- `dispatcher  (path, state)` - метод вызывается при переходе на новый url адрес.
 ```
    module.$$rout({
        path: '/module_name/item/1',
        state: {
            id: 1,
            name: "Example"
        },
    });
```
каждый модуль имеет метод `$$rout`. После перехода на новый роут в каждом модуле вызывается метод `dispatcher`
Метод  dispatcher принимает `path` - массив `['module_name', 'item', '1']` и `state` - `{id: 1, name: "Example"}`
- `mounted  (module, layout)` - метод вызывается после инициализации всех модулей.
mounted принимает объекты module - текущий Page модуль и  layout - текущий Layout модуль


[webix]: https://webix.com/
[vue]: https://vuejs.org/
[quasar]: https://quasar.dev/
[react]: https://reactjs.org/
[angular]: https://angular.io/
[mediator]: https://refactoring.guru/ru/design-patterns/mediator
[observer]: https://refactoring.guru/ru/design-patterns/observer
[rout]: https://developer.mozilla.org/ru/docs/Web/API/History_API
[alias]: https://webpack.js.org/configuration/resolve/#resolvealias