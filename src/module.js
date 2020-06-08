import Observable from './observ';
export default class Module extends Observable {
  /**
   * Класс является родителем для всех модулей кроме главного модуля (Root Module). </br>
   * Наследуется от класса Observable для реализации паттерна [Наблюдатель (Observer)]{@link https://refactoring.guru/ru/design-patterns/observer}. </br>
   * Объект модуля реализует паттерн [Одиночка (Singleton)]{@link https://refactoring.guru/ru/design-patterns/singleton}. </br>
   * Каждый модуль создается только 1 раз, последующий вызов new Module() - вернет текущий экзепляр данного класса.
   * @example <caption>Пример создания модуля</caption>
   * import Onedeck from 'onedeck';
   *
   * export default class ModuleName extends Onedeck.Module { ... }
   *
   * @example <caption>Пример получения экземпляра модуля</caption>
   * import Module from 'ModuleName/module.js'
   * const module = new Module()
   * // Событие уровня модуля
   * module.$$emit('eventName', data)
   * // Событие уровня приложения
   * module.$$gemit('eventName', data)
   *
   * @Module Module
   */
  constructor() {
    super();
    /**
     * Объект содержит в себе инстансы всех моулей
     * Модуль создается только 1 раз
     */
    Module.instances = Module.instances || {};

    if (Module.instances[this.constructor.name]) {
      return Module.instances[this.constructor.name];
    }

    Module.instances[this.constructor.name] = this;
  }

  /**
   * Абстрактный метод. Обработчик событий. </br>
   * В этом методе должны быть описаны все события текущего моудля. </br>
   * @abstract
   * @example
   * eventHandler () {
   *   // Cоздаем событие уровня модуля в котором эмитим событие уровня приложения
   *   this.$on('event1', (data) => this.$$gemit(data));
   *   // Cоздаем событие уровня модуля в котором выполняем метод doSomething
   *   this.$on('event2', (data) => this.doSomething(data));
   * }
   */
  eventHandler () { }

  /**
   * Абстрактный метод. Инициализация приложения модуля. </br>
   * В этом методе должна быть описана инициализация приложения модуля. </br>
   * Метод автоматически вызывается для каждого модуля старницы при переходе на страницу модуля. </br>
   * Для Global модуля - вызыввается только 1 раз, при инициализации приложения. </br>
   * Вызывается в следующем порядке: </br>
   * - init Layout модуля если на старнице меняется Layout </br>
   * - init Page модуля </br>
   * - init Embed модулей в произвольном порядке </br>
   *
   * @example
   * init (path, state) {
   *   console.log('init', this.constructor.name, path, state);
   *   // Создаем приложение модуля
   *   this.reactApp = ReactDOM.render(<App />, document.getElementById('MainContent'));
   *   // Вызываем обработчик событий
   *   this.eventHandler();
   * }
   *
   * @param {Array} path - массив с элементами url адреса.
   * @param {Object} state - current state.
   * @abstract
   */
  init () { }

  /**
   * Абстрактный метод. Деструктор. </br>
   * В этом методе должна быть описана деструктуризация модуля. </br>
   * Метод автоматически вызывается для каждого модуля старницы при переходе на другую старницу приложнеия. </br>
   * Для Global модуля - дестуркторизация не производится. </br>
   *
   * @example
   * init (path, state) {
   *   console.log('init', this.constructor.name, path, state);
   *   // Создаем приложение модуля
   *   this.reactApp = ReactDOM.render(<App />, document.getElementById('MainContent'));
   *   // Вызываем обработчик событий
   *   this.eventHandler();
   * }
   * @abstract
   */
  destroy () { }

  /**
   * this method must be overridden by sub class.
   * performs various actions depending on the argument
   * @param {string} path - url.
   * @param {Object} state - current state.
   * @abstract
   */
  dispatcher () { }

  /**
  * Called immediately after mounting
  * child module to the root module
  * The method must be overridden in the Root module.
  *
  * метод жиненого цикла , вызывается после того как модуль смотнирован,
  * в этом методе доступен объект currentModule и currentModule
  * @param {Object} currentModule - текущий модуль.
  * @param {Object} currentLayout - текущий макет.
  * @abstract
  */
  mounted () { }
}
