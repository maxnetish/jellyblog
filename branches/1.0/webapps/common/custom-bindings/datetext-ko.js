/**
 * Created by Gordeev on 27.07.2014.
 */
define('binding.ko-datetext',
    [
        'ko',
        'moment',
        '_'
    ],
    function (ko, moment, _) {
        var formatDate = function(date, format){
            var dateNormilized,
                result;

            format = format || 'LL';
            //sanitize date:
            if(_.isDate(date)){
                dateNormilized = date;
            }else if(_.isString(date) || _.isNumber(date)){
                dateNormilized = new Date(date);
            }else{
                return date;
            }

            result = moment(dateNormilized).format(format);
            return result;
        };

        (function(){
            ko.bindingHandlers.dateText = {
                update: function(element, valueAccessor, allBindings){
                    var $element=$(element),
                        rowDate = ko.utils.unwrapObservable(valueAccessor()),
                        format = allBindings.get('date-format');

                    $element.text(formatDate(rowDate, format));
                }
            };
        })();
    });