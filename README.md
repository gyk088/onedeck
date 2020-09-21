#  ONEDECK (Микросервисный фронтенд)

##### Фреймворк ONEDECK позволяет легко писать микросервисы во фронтенде.
##### В рамках данного фреймворка микросервис для фронтенда называется модуль.
ONEDECK позволяет легко делить ваше приложение на модули и собирать его как конструктор из набора модулей.
В дальнейшем модули легко переиспользовать.

##### GitHub фреймворка [Git][git]
##### Пример приложения [Git][example-git]
##### Пример собранного приложения [EXAMPLE][example-site]
##### Документация [ESDoc][doc]

## Модуль (микросервис, фрагмент)

Модуль - независимая, логически законченная единица приложения.

- Может быть написан c помощью любого фреймворка ([Vue][vue], [React][react], [Angular][angular], [Webix][webix] ... );

- Можно легко собрать отдельно от всего приложения;

- Динамически импортируется;

## Виды модулей
Все модули, за исключением Root модуля, наследуются от базового класса onedeck.Module.
Root модуль наследуется от базового класса onedeck.RootModule.

- **Root Module** Главный модуль приложения. Инициализируется один раз при старте приложения и инициализирует все модули приложения. Все модули общаются между собой через Root модуль с помощью событий. Реализует паттерн [Медиатор][mediator].
- **Page Module**   Модуль страницы. Инициализируется при переходе на страницу модуля. Каждый модуль страницы соответствует конкретному url адресу. Может встраиваться в модуль макета (Layout module) и содержать в себе встраиваемые модули (Embed Module)
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
## Alias в webpack.config
Для того чтобы пути в модуле располагались относительно модуля, следует прописать директиву [alias][alias] в `webpack.config`
 ```
 resolve: {
    alias: {
      ModuleName: path.resolve(__dirname, src/modules/ModuleName),
      ...
    }
  },
 ```

#### Можно автоматизировать данную процедуру
[alias][alias] в `webpack.config`:
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
- `rootPath: String` - начальный роут. Если наше приложение стартует от пути `http://localhost:3000/example/path/`, в rootPath необходимо указать `/example/path/`;
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

##### Мы можем использовать разные модули для различных условий:
```
main: {
  layout: window.innerWidth < 1000 ? 'Layout1' : 'Layout2' ,
  module: window.innerWidth < 1000 ? 'Module1' : 'Module2' ,
  embed: {
    example: {
      module: window.innerWidth < 1000 ? 'Embed1' : 'Embed2' ,
    },
  },
},
```

#### Старт приложения (index.js):
```
import Config from './conf';
new Config.rootModule(Config);
```
При старте приложнеия нам нужно инициализировать ROOT модуль, он в свою очередь проинициализирует нужные нам модули.

## Пример Root модуля
```
import Onedeck from 'onedeck';
import ExampleNotification from 'ExampleNotification/module';
import ExampleGlobalWnd from 'ExampleGlobalWnd/module';

export default class Root extends Onedeck.RootModule {
  init (path) {
    console.log('init', this.constructor.name, path);
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
Root module - является ядром всего приложения, наследуется от Onedeck.RootModule

Модуль описывает следующие методы
- `init (path)` - инициализация Root модуля. При инициализации нужно вызвать метод `this.eventHandler();`
- `eventHandler ()` - в этом методе мы описываем все события уровня приложения (глобальные)
```
    this.$$on('examplEvent', (exampleData) => {
      this.exampleAction(exampleData);
    });
```
после этого объявления (`this.$$on`) в каждом модуле можно вызвать это событие  `module.$$gemit('examplEvent', data)`
- `dispatcher  (path, state)` - метод вызывается при переходе на новый url адрес.
 ```
    module.$$route({
        path: '/module_name/item/1',
        state: {
            id: 1,
            name: "Example"
        },
    });
```
Все модули имеют метод `$$route`. После перехода на новый роут в каждом модуле вызывается метод `dispatcher`
Метод  dispatcher принимает `path` - массив `['module_name', 'item', '1']` и `state` - `{id: 1, name: "Example"}`
- `mounted  (module, layout)` - метод вызывается после инициализации всех модулей.
mounted принимает объекты module - текущий Page модуль и  layout - текущий Layout модуль

## Пример Модуля
```
import Onedeck from 'onedeck';
import App from 'ExampleModule/App.vue';
import Vue from 'vue';

/**
 * Class ExampleModule
 * module use Vue
 */
export default class ExampleModule extends Onedeck.Module {
  init (path, state) {
    console.log('init', this.constructor.name, path, state);

    this.VueApp = new Vue(App);
    this.eventHandler();
  }

  eventHandler () {
    this.$$on('onAuth', () => this.$$route({
      path: '/main/',
      state: null,
    }));
  }

  dispatcher (path, state) {
    console.log('dispatcher', this.constructor.name, path, state);
  }

  mounted (module, layout) {
    console.log('mounted', this.constructor.name, module, layout);
  }

  destroy () {
    this.$$offAll()
    this.VueApp.$destroy();
    document.getElementById('ROOT').innerHTML = '';
  }
}
```
Module - наследуется от Onedeck.RootModule

## Хуки жизненного цикла
##### `init (path, state)` - инициализация модуля. В этом методе необходимо вызвать  `eventHandler` метод для обработки событий
`@param {Array} path` - массив с элементами url адреса. `['module_name', 'item', '1']`
`@param {Object} state ` - данные переданные с url.
###### `init` срабатывает в следующем порядке:
- Для Root и Global модулей срабатывает 1 раз при инициализации приложения.
- Для Embed модуля, который встраивается в Global - 1 раз при инициализации.
- Для Layout модуля - каждый раз при смене Layout.
- Для Page модуля и для Embed модуля - каждый раз при смене Page модуля.

##### `dispatcher(path, state)` - диспетчер, в этом методе необходимо описать действия при смене url.
`@param {Array} path` - массив с элементами url адреса. `['module_name', 'item', '1']`
`@param {Object} state ` - данные переданные с url.
###### `dispatcher` вызывается в следующем порядке:
 1. Вызывается dispatcher Root модуля.
 2. Вызывается dispatcher Globla модуля.
 3. Вызываются dispatcher Embed модулей, которые встраиваются в Globla модуль.
 4. Вызывается dispatcher Layout модуля.
 5. Вызывается dispatcher Page модуля.
 6. Вызываются dispatcher Embed модулей, которые встраиваются в Page модуль.

##### `mounted(currentModule, currentLayout)` - вызывается после того как все модули смонтированы в DOM дерево
 `@param {Object} currentModule` - текущий Page модуль.
 `@param {Object} currentLayout` - текущий Layout модуль.
###### `mounted` вызывается в следующем порядке:
 1. Вызывается mounted Root модуля.
 2. Вызывается mounted Globla модуля.
 3. Вызываются mounted Embed модулей, которые встраиваются в Globla модуль.
 4. Вызывается mounted Layout модуля.
 5. Вызывается mounted Page модуля.
 6. Вызываются mounted Embed модулей, которые встраиваются в Page модуль.

##### `destroy ()` - деструктор модуля. В деструкторе необходимо уничтожить объект модуля, почистить DOM дерево, отписаться от событий модуля.
###### `destroy` срабатывает в следующем порядке:
- Для Root, Global и Embed (который встраивается в Global) модулей не вызывается, данные модули активны на всем протяжении работы приложения.
- Для Layout модуля - каждый раз при смене Layout.
- Для Page и Embed модулей - каждый раз при смене Page модуля.

## События
ONEDECK предоставляет два типа событий:  события уровня модуля `$$emit` и события уровня приложения `$$gemit`
#### Cобытия уровня модуля `$$emit`
Каждый модуль имеет в себе реализацию паттерна [observer][observer]
Модуль может создавать события c помощью методов `$$on` или `$$onOnce`
Желательно создавать события в методе `eventHandler`, но возможны и другие варианты.
Пример создания события:
```
  eventHandler () {
    // Можно так
    this.$$on('onExample1', (data) => {
        console.log(data)
    });
    // Но лучше так
    this.$$on('onExample2', this.onExample2Listener);
  }
```
После того как мы создали событие, можно вызвать его в любом месте модуля. (пример Vue.js):
```
<script>
import store from 'Example/store';
import { mapState, mapMutations } from 'vuex';
import Module from 'Example/module';

export default {
  el: '#Embed',
  name: 'EmbedApp',
  store,
  computed: {
    ...mapState({
      data: (state) => state.data,
    }),
  },
  methods: {
    ...mapMutations(['setData']),
    notify() {
      // Так как каждый модуль реализует Singleton, мы получим текущий экземпляр данного модуля.
      const module = new Module()
      module.$$emit('onExample1', this.data)
    }
  },
};
</script>
```
```
import Module from 'Example/module';
// Так как каждый модуль реализует Singleton, мы получим текущий экземпляр данного модуля.
const module = new Module()
module.$$emit('onExample1', this.data)
```
Так же мы можем отписаться от события:
1. `this.$$off('onExample2', this.onExample2Listener)`
2. `this.$$offAll()`

#### События уровня приложения `$$gemit`
В приложении есть глобальные события. Они необходимы для общения между модулями.
Модуль ROOT реализует паттерн [Mediator][mediator]. Все глобальные события создает модуль ROOT.
События создаются точно также, как и в обычном модуле, с помощью методов `$$on` или `$$onOnce`.
```
import ExampleNotification from 'ExampleNotification/module';
import ExampleGlobalWnd from 'ExampleGlobalWnd/module';
import axios from 'axios';

export default class Root extends Onedeck.RootModule {
  init (initObj) {
    ...
    this.eventHandler();
  }

  eventHandler () {
    this.$$on('onExampleEvent', (exampleData) => {
      this.exampleAction(exampleData);
    });

    this.$$on('onShowGlobalWnd', () => {
      const wnd = new ExampleGlobalWnd();
      wnd.show();
    });

    this.$$on('onNotify', (text) => {
      const notifyObj = new ExampleNotification();
      notifyObj.notify(text);
    });

    axios.interceptors.response.use(undefined, (error) => {
        const notifyObj = new ExampleNotification();
        notifyObj.ajaxError(text);
        return Promise.reject(error);
    });
  }
}
```
Теперь каждый модуль может вызвать необходимое нам событие с помощью метода `$$gemit`.
 ```
import Module from 'Example/module';
// Так как каждый модуль реализует Singleton, мы получим текущий экземпляр данного модуля.
const module = new Module()
module.$$gemit('onNotify', this.data)
```
## Роутинг
ONEDECK позволяет использовать 2 вида роутинга [HISTORY API][historyapi] и хэш роутинг (с помощью #)
Чтобы переключиться между этими двумя режимами необходимо в конфиге задать параметр **`historyApi`**.
`true` - роутинг с помщью [HISTORY API][historyapi]
`false` - хэш роутинг (с помощью #)

#### Метод `$$route`
Каждый модуль имеет метод `$$route`.
 ```
 import Module from 'Example/module';
 const module = new Module()
 module.$$route({
  path: '/module_name/item/1',
  state: {id: 1, name: 'example'},
})
 ```
 `state: {id: 1, name: 'example'}` - данные, которые мы передаем по этому url адресу, (см. раздел **Хуки жизненного цикла**, метод `init` и метод `dispatcher`)
 ` path: '/module_name/item/1'` -  перевый элемент url адреса `module_name` должен совпадать с ключем конфига моудля (см. раздел **Конфиг файл**)
```
module_name: {
  layout: 'ExampleLayout',
  module: 'ExampleModule',
},
```

[webix]: https://webix.com/
[vue]: https://vuejs.org/
[quasar]: https://quasar.dev/
[react]: https://reactjs.org/
[angular]: https://angular.io/
[mediator]: https://refactoring.guru/ru/design-patterns/mediator
[observer]: https://refactoring.guru/ru/design-patterns/observer
[rout]: https://developer.mozilla.org/ru/docs/Web/API/History_API
[alias]: https://webpack.js.org/configuration/resolve/#resolvealias
[historyapi]: https://developer.mozilla.org/ru/docs/Web/API/History_API
[example-site]: https://gyk088.github.io/onedeckExampleSite
[example-git]: https://github.com/gyk088/ondeckExample
[doc]:https://gyk088.github.io/onedeck_doc/
[git]: https://github.com/gyk088/onedeck