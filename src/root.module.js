import Observable from './observ';

export default class RootModule extends Observable {
  /**
   * Класс является родителем для главного модуля (Root Module). </br>
   * Наследуется от класса Observable для реализации паттерна [Наблюдатель (Observer)]{@link https://refactoring.guru/ru/design-patterns/observer}. </br>
   * Объект Root модуля реализует паттерн [Посредник (Mediator)]{@link https://refactoring.guru/ru/design-patterns/mediator}. </br>
   * @Module RootModule
   *
   * @example
   * import Onedeck from 'onedeck';
   *
   * export default class Root extends Onedeck.RootModule { ... }
   *
   * @param {Object} config - конфиг приложения (пример конфига в README.md)
   */
  constructor(config) {
    super();
    // this object contains config object
    // конфиг, доступен в каждом модуле
    // Присваиваем функцию import и удаляем ее из конфига
    this._import = config.import;
    config.import = null;
    this.$$config = config;
    // this object contains current module
    // объект с текущим модулем
    this.$$currentModule = {};
    // this object contains current layout
    // объект с текущим макетом
    this.$$currentLayout = {};
    // this object contains all modules
    // объек содержит все модули приложения которые были инициализированы
    this._modules = {};
    // this object contains all layouts
    // объек содержит все макеты приложения которые были инициализированы
    this._layouts = {};

    // состояние по указоннму url (если не используем history api)
    this._urlState = {};

    // инициализируем глобальные модули
    this._initGlobalModules().then(() => {
      // вызываем глобаьное событие popstate
      this._eventHandler();

      // получаем массив с данными из url
      const urlData = this._getModuleFromUrl(
        this.$$config.historyApi ? document.location.pathname : document.location.hash,
      );

      // вызывам метод init для модуля root
      this.init(urlData.url, urlData.params);

      // current module initialization
      this._initModule({
        module: urlData.url,
        queryParam: urlData.params,
        path: document.location.pathname,
      });
    }).catch((e) => {
      console.error('Error init global module', e);
    });
  }

  /**
   * Абстрактный метод. Инициализация приложения. </br>
   * В этом методе должна быть описана инициализация приложения. </br>
   * Метод вызывается 1 раз при инициализации всего приложения. </br>
   *
   * @example
   * init (path) {
   *   console.log('init', this.constructor.name, path);
   *
   *   // Вызываем обработчик событий
   *   this.eventHandler();
   * }
   *
   *
   * @param {Array} path - массив с элементами url адреса.
   * @abstract
   */
  init () { }

  /**
   * Абстрактный метод. Обработчик событий. </br>
   * В этом методе должны быть описаны все события уровня приложения, которые будут доступны в каждом модуле. </br>
   *
   * @example
   * eventHandler () {
   *  // Обработка ошибок http запросов
   *  axios.interceptors.response.use(undefined, (error) => {
   *     this.ajaxError(error.response.data);
   *     return Promise.reject(error);
   *  });
   *
   *  // Событие открывает окно
   *  this.$$on('showGlobalWnd', () => {
   *    const wnd = new ExampleGlobalWnd();
   *    wnd.show();
   *  });
   *
   *  // Событие показывает уведомление
   *  this.$$on('notify', (text) => {
   *    const notifyObj = new ExampleNotification();
   *    notifyObj.notify(text);
   *  });
   * }
   *
   * @abstract
   */
  eventHandler () { }

  /**
  * Абстрактный метод. Монитирование модуля. </br>
  * Метод автоматически вызывается для каждого модуля при изменении url адреса. </br>
  * В методе доступны объекты currentModule и currentLayout. </br>
  * Вызывается в следующем порядке: </br>
  * - mounted Root модуля </br>
  * - mounted всех Global модулей в произвольном порядке </br>
  * - mounted Layout модуля </br>
  * - mounted Page модуля </br>
  * - mounted Embed модулей в произвольном порядке </br>
  * @example
  * mounted (module, layout) {
  *   console.log('mounted', this.constructor.name, module, layout);
  * }
  *
  * @param {Object} currentModule - текущий Page модуль.
  * @param {Object} currentLayout - текущий Layout модуль.
  * @abstract
  */
  mounted () { }

  /**
   * Абстрактный метод. Диспетчер. </br>
   * В этом методе должна быть описана логика модуля связанная с маршрутизацией. </br>
   * Метод автоматически вызывается для каждого модуля при изменении url адреса. </br>
   * Вызывается в следующем порядке: </br>
   * - dispatcher Root модуля </br>
   * - dispatcher всех Global модулей в произвольном порядке</br>
   * - dispatcher Layout модуля </br>
   * - dispatcher Page модуля </br>
   * - dispatcher Embed модулей в произвольном порядке </br>
   *
   * @example
   * dispatcher (path, state) {
   *   console.log('dispatcher', this.constructor.name, path, state);
   *   // Если путь my.site.com/moduleName/item/3
   *   if (path[1] === 'item') this.showItem(state, path[2]);
   * }
   *
   * @param {string} path - массив с элементами url адреса.
   * @param {Object} state - данные переданные с url.
   * @abstract
   */
  dispatcher () { }

  /**
   * В каждом модуле содержиться метод $$rout. </br>
   * Метод необходим для реализации маршрутизации, так же может передавать данные.
   * @example <caption>Создания события для роутинга</caption>
   * this.$$on('onRout', (data) => this.$$rout({
   *     path: `/module_name/item/${data.id}`,
   *     state: data
   *  })
   * @example  <caption>Переход на другую страницу</caption>
   * import Module from 'ModuleName/module.js'
   * const module = new Module()
   *
   * module.$$rout({
   *     path: '/module_name/item/1',
   *     state: {
   *         id: 1,
   *         name: 'Example',
   *         ...
   *     },
   *  })
   *
   * @param {Object} routData - Объек содержит url и state.
   * @param {string} routData.path  - url, first element module name.
   * @param {Object} routData.state - state passed from the module.
   */
  $$rout (routData) {
    let path = this.$$config.rootPath ? this.$$config.rootPath + routData.path : routData.path;
    // Удалем двойные '//'
    path = path.replace(/\/\//, '/');
    if (this.$$config.historyApi) {
      // Если используем history Api - вызываем инициализацию модуля
      const urlData = this._getModuleFromUrl(path)
      this._initModule({
        module: urlData.url,
        path,
        state: routData.state,
        pushState: true,
        queryParam: urlData.params,
      });
    } else {
      // Если не используем - то сохраняем состояние, и переходим по нужному пути
      // Далее вызовится событие "hashchange" - в котором и произойдет вызов метода initModule
      this._urlState[path] = routData.state;
      document.location.hash = path;
    }
  }

  /**
  * Приватный метод вызывает методы mounted всех модулей (см описание метода mounted)
  * @private
  */
  _mounted () {
    this.mounted(this.$$currentModule, this.$$currentLayout);

    Object.keys(this._modules)
      .filter((moduleName) => this._modules[moduleName].$$global)
      .forEach((moduleName) => {
        this._modules[moduleName]
          .mounted(this.$$currentModule, this.$$currentLayout)

        // Встроенные модули
        Object.keys(this._modules[moduleName].$$embed)
          .forEach((name) => this._modules[moduleName].$$embed[name]
            .mounted(this.$$currentModule, this.$$currentLayout));
      });

    if (this.$$currentLayout.obj) {
      this.$$currentLayout.obj.mounted(this.$$currentModule, this.$$currentLayout);
    }

    if (this.$$currentModule.obj) {
      this.$$currentModule.obj.mounted(this.$$currentModule, this.$$currentLayout);
      Object
        .keys(this.$$currentModule.obj.$$embed)
        .forEach((name) => this.$$currentModule.obj.$$embed[name]
          .mounted(this.$$currentModule, this.$$currentLayout));
    }
  }

  /**
  * Приватный метод вызывает метд destroy Page модуля и Embed модуле (см описание метода destroy в классе Module)
  * @private
  */
  _destroyModule () {
    // Если переход на новый макет то чистим модуль а потом макет
    if (this.$$currentModule.obj) {
      this.$$currentModule.obj.destroy();
      Object
        .keys(this.$$currentModule.obj.$$embed)
        .forEach((name) => this.$$currentModule.obj.$$embed[name].destroy());
      this.$$currentModule = {};
    }
  }

  /**
   * Приватный метод вызывает метд destroy Layout модуля (см описание метода destroy в классе Module)
   * @private
   */
  _destroyLayout () {
    if (this.$$currentLayout.obj) {
      this.$$currentLayout.obj.destroy();
      this.$$currentLayout = {};
    }
  }

  /**
  * Приватный метод вызывает методы dispatcher всех модулей (см описание метода dispatcher)
  * @param {Array} path - url array
  * @param {Object} state - current state
  * @param {Object} queryParam - параметры переданные вместе с url
  * @private
  */
  _dispatcherModule (path, state, queryParam) {
    this.dispatcher(path, state, queryParam);
    // Вызываем диспатчеры для глобальных модулей
    Object.keys(this._modules)
      .filter((moduleName) => this._modules[moduleName].$$global)
      .forEach((moduleName) => {
        this._modules[moduleName].dispatcher(path, state, queryParam);

        // Встроенные модули
        Object.keys(this._modules[moduleName].$$embed)
          .forEach((name) => this._modules[moduleName].$$embed[name]
            .dispatcher(path, state, queryParam));
      });
    // Если переход на новый макет то чистим модуль а потом макет
    if (this.$$currentModule.obj) {
      // Вызываем диспатчер для текущего модуля
      this.$$currentModule.obj.dispatcher(path, state, queryParam);
      // Вызываем диспатчеры для всторенных модулей
      Object.keys(this.$$currentModule.obj.$$embed)
        .forEach((name) => this.$$currentModule.obj.$$embed[name].dispatcher(path, state, queryParam));
    }
  }

  /**
  * Приватный метод парсить текущий урл
  * получаем название модуля и данные модуля url адреса,
  * @param {String} url - url
  * @returns {Arrat} массив сторк (разбитый урл адрес через / )
  * @private
  */
  _getModuleFromUrl (url) {
    // Удалем ненужный нам путь
    if (this.$$config.rootPath) {
      url = url.replace(this.$$config.rootPath, '');
    }
    // Удалем первый '/' и #
    url = url.replace(/^[\/, #]/, '');

    const [urlParam, queryParam] = url.split('?')
    const params = {}

    if (queryParam) {
      queryParam.split('&').forEach(param => {
        const [key, val] = param.split('=')
        params[key] = val
      })
    }

    return {
      url: urlParam.split('/'),
      params
    }
  }

  _initGlobalModules = async () => {
    const globalNames = Object.keys(this.$$config.modules)
      .filter((moduleName) => this.$$config.modules[moduleName].global);

    for (let i = 0; i < globalNames.length; i++) {
      // eslint-disable-next-line
      await this._createModule(globalNames[i], this.$$config.modules[globalNames[i]])
    }
  }

  /**
  * Приватный метод. Cоздает объект Page модуля и Embed модуля
  * получаем название модуля и данные модуля url адреса,
  * @param {String} moduleName - название модуля  (в конфиге параметр module)
  * @param {Object} moduleConf - настройки модуля
  * @private
  */
  _createModule = async (moduleName, moduleConf) => {
    // Если уже подгрузили module - выходим
    if (this._modules[moduleName]) return;

    let ModuleClass = await this._import(moduleConf.module);
    if (!ModuleClass || !ModuleClass.default) {
      throw new SyntaxError(`Error load module: ${moduleName}`);
    }
    ModuleClass = ModuleClass.default;

    // создаем модуль
    this._modules[moduleName] = new ModuleClass();
    // глобальный модуль
    this._modules[moduleName].$$global = moduleConf.global;
    // добавляем метод rout для маршрутизации
    this._modules[moduleName].$$rout = this.$$rout.bind(this);
    // добавляем метод  publish для публикации глобальных событий
    this._modules[moduleName].$$gemit = this.$$emit.bind(this);
    // конфиг
    this._modules[moduleName].$$config = this.$$config;
    // макет модуля
    this._modules[moduleName].$$layoutName = moduleConf.layout;
    // встраиваемые модули
    this._modules[moduleName].$$embed = {};

    if (moduleConf.embed) {
      const embedNames = Object.keys(moduleConf.embed);

      for (let i = 0; i < embedNames.length; i++) {
        // eslint-disable-next-line
        let EmbedClass = await this._import(moduleConf.embed[embedNames[i]].module);
        if (!EmbedClass || !EmbedClass.default) {
          throw new SyntaxError(`Error load module: ${embedNames[i]}`);
        }
        EmbedClass = EmbedClass.default;

        this._modules[moduleName].$$embed[embedNames[i]] = new EmbedClass();
        this._modules[moduleName].$$embed[embedNames[i]].$$rout = this.$$rout.bind(this);
        this._modules[moduleName].$$embed[embedNames[i]].$$gemit = this.$$emit.bind(this);
        this._modules[moduleName].$$embed[embedNames[i]].$$config = this.$$config;
      }
    }

    // Если модуль глобальный - сразу его инициализируем
    if (this._modules[moduleName].$$global) {
      this._modules[moduleName].init(moduleName);

      // Инициализируем встроенные модули
      Object.keys(this._modules[moduleName].$$embed)
        .forEach((name) => this._modules[moduleName].$$embed[name]
          .init(moduleName));
    }
  }

  /**
  * Приватный метод. Cоздает объект Layout модуля
  * получаем название модуля и данные модуля url адреса,
  * @param {String} layoutName - название модуля  (в конфиге параметр layout)
  * @private
  */
  _createLayout = async (layoutName) => {
    // Если уже подгрузили layout - выходим
    if (this._layouts[layoutName]) return;

    let LayoutClass = await this._import(layoutName);
    if (!LayoutClass || !LayoutClass.default) {
      throw new SyntaxError(`Error load module: ${layoutName}`);
    }
    LayoutClass = LayoutClass.default;

    // создаем макет
    this._layouts[layoutName] = new LayoutClass();
    // добавляем метод rout для маршрутизации
    this._layouts[layoutName].$$rout = this.$$rout.bind(this);
    // добавляем метод  publish для публикации глобальных событий
    this._layouts[layoutName].$$gemit = this.$$emit.bind(this);
    // конфиг
    this._layouts[layoutName].$$config = this.$$config;
  }

  /**
   * Приватный метод. Содержит обработку событий popstate или hashchange. </br>
   * Обработка события popstate или hashchange зависит от параметра в конфиге historyApi
   * @private
   */
  _eventHandler () {
    if (this.$$config.historyApi) {

      window.addEventListener('popstate', (event) => {
        const urlData = this._getModuleFromUrl(document.location.pathname)
        this._initModule({
          module: urlData.url,
          path: document.location.pathname,
          state: event.state,
          queryParam: urlData.params
        })
      });
    } else {
      window.addEventListener('hashchange', () => {
        const urlData = this._getModuleFromUrl(document.location.hash)
        this._initModule({
          module: urlData.url,
          path: document.location.hash,
          state: this._urlState[document.location.hash.replace(/^#/, '')],
          queryParam: urlData.params
        })
      });
    }
  }

  /**
   * Приватный метод инициализации модуля. </br>
   * Инициализируем  Page Layout Embed модули в зависимости от url адресв
   * @param {Object} moduleData - initn module data.
   * @param {Array} moduleData.module - массив url адреса. В нулевом элементе module[0] содержиться имя модлуя.
   * @param {Object} moduleData.queryParam - данные передданые в url.
   * @param {string} moduleData.path - url.
   * @param {Object} moduleData.state - current state.
   * @param {boolean} moduleData.pushState - flag indicates save to history api.
   * @private
   */
  _initModule = async (moduleData) => {
    const moduleName = moduleData.module[0];

    const mudules = this.$$config.modules;

    if (!moduleName) {
      this.$$rout({
        path: this.$$config.mainModule,
      });
      return;
    }

    if (!mudules[moduleName]) {
      this.$$rout({
        path: this.$$config.module404,
      });
      console.error('no such module:', moduleName);
      return;
    }

    // Если это глобальный или встраиваемый модуль - они не учавствует в роутинге
    if (mudules[moduleName].global) {
      this.$$rout({
        path: this.$$config.module404,
      });
      console.error('global module:', moduleName);
      return;
    }

    // Создаем макет если он есть
    if (
      mudules[moduleName].layout
      && mudules[moduleName].layout === this.$$currentLayout.name
    ) {
      // Если переход внутри текущего макета
      this.$$currentLayout.obj.dispatcher(moduleData.module, moduleData.state, moduleData.queryParam);
    } else if (mudules[moduleName].layout) {
      this._destroyModule();
      this._destroyLayout();

      // Если переход на новый макет то чистим модуль а потом макет
      try {
        await this._createLayout(mudules[moduleName].layout);
      } catch (e) {
        console.error(e);
      }
      // Cохраняем новый модуль в объекте currentModule
      this.$$currentLayout = {
        name: mudules[moduleName].layout,
        obj: this._layouts[mudules[moduleName].layout],
      };

      // Инициализируем новый макет (вызываем метод init)
      this.$$currentLayout.obj.init(moduleData.module, moduleData.state, moduleData.queryParam);
    } else {
      // Если у модуля нет макета - уничтожаем текущий макет
      this._destroyModule();
      this._destroyLayout();
    }

    // Если переход внутри текущего модуля - вызываем диспатчер модуля
    if (
      this.$$currentModule.name
      && this.$$currentModule.name === moduleName
    ) {
      // Если переход внутри текущего модуля - вызываем диспатчер модуля (метода dispatcher)
      this._dispatcherModule(moduleData.module, moduleData.state, moduleData.queryParam);
    } else {
      // Если переход на новый модуль - вызываем деструктор текущего модуля (метод destroy)
      this._destroyModule();

      // Если переход на новый макет то чистим модуль а потом макет
      try {
        await this._createModule(moduleName, mudules[moduleName]);
      } catch (e) {
        console.error(e);
      }

      // Cохраняем новый модуль в объекте currentModule
      this.$$currentModule = {
        name: moduleName,
        obj: this._modules[moduleName],
      };

      // Инициализируем новый модуль (вызываем метод init)
      this.$$currentModule.obj.init(moduleData.module, moduleData.state, moduleData.queryParam);
      // Инициализируем встроенные модули
      Object.keys(this.$$currentModule.obj.$$embed)
        .forEach((name) => this.$$currentModule.obj.$$embed[name]
          .init(moduleData.module, moduleData.state, moduleData.queryParam));

      this._dispatcherModule(moduleData.module, moduleData.state, moduleData.queryParam);
    }

    // Если используем history api - сохраняем новое состояние в истоии браузера
    if (moduleData.pushState && this.$$config.historyApi) {
      window.history.pushState(
        moduleData.state,
        moduleName,
        moduleData.path,
      );
    }

    // Вызываем методы жизненого цикла
    this._mounted();
  }
}
