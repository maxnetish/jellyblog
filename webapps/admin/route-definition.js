/**
 * Created by Gordeev on 22.07.2014.
 */
define('route-definition', [], function ($, path, ko, _) {
    var RouteDefinition = function (row) {
            this.view = row.view || '';                // селектор на участок разметки
            this.viewModel = row.viewModel || null;    // объект - вьюмодель
            this.enter = row.enter || null;            // колбек - перед изменением роута
            this.on = row.on || null;                  // колбек - после изменения роута
            this.exit = row.exit || null;              // колбек - перед выходом из роута
            this.state = row.state || null;            // объект, который будет передаваться в колбеки
            this.route = row.route || '';              // шаблон пути типа '#!/user/(:userId)'
        },
        definitions = [

        ];

    return {
        definitions: definitions,
        RouterDefinition: RouteDefinition
    }
});