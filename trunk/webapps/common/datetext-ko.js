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
        var formatDate = function(date){
            var dateNormilized,
                result;

            //sanitize date:
            if(_.isDate(date)){
                dateNormilized = date;
            }else if(_.isString(date) || _.isNumber(date)){
                dateNormilized = new Date(date);
            }else{
                return date;
            }

            result = moment(dateNormilized).format('LL');
            return result;
        };

        (function(){
            ko.bindingHandlers.dateText = {
                update: function(element, valueAccessor){
                    var $element=$(element),
                        rowDate = ko.utils.unwrapObservable(valueAccessor());

                    $element.text(formatDate(rowDate));
                }
            };
        })();
    });