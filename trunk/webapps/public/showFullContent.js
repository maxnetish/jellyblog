/**
 * Created by mgordeev on 14.08.2014.
 */
define('show-full-content',
    [
        'jquery'
    ],
    function ($) {
        var showFull = function (id, button) {
                button.addClass('disabled');
                $.get('/api/post', {id: id})
                    .done(function (result) {
                        var newContent = result.content.replace('%CUT%', ''),
                            $contentElement = $('div[data-post-content-id="' + id + '"]'),
                            $fakeElement = $('<div>'),
                            newH = 0;

                        // calc height for new content using hidden element
                        $fakeElement
                            .addClass($contentElement.attr('class'))
                            .css({
                                position: 'absolute',
                                visibility: 'hidden',
                                width: $contentElement.innerWidth()
                            })
                            .appendTo($contentElement.parent())
                            .html(newContent);
                        newH = $fakeElement.height();
                        $fakeElement.remove();

                        // fix content height
                        $contentElement.height($contentElement.height());
                        $contentElement.html(newContent);
                        button.hide();
                        // transition to new height...
                        $contentElement.height(newH);
                        setTimeout(function () {
                            // clear height when transition done
                            $contentElement.height('');
                        }, 1000);
                    })
                    .always(function () {
                        button.removeClass('disabled');
                    });
            },
            onCommand = function (event) {
                var $this = $(this),
                    id = $this.data('cmd-show-full');
                showFull(id, $this);
            },
            bind = function () {
                $('div.main-wrapper').on('click', 'a[data-cmd-show-full]', onCommand);
            };

        return {
            bind: bind
        };
    });