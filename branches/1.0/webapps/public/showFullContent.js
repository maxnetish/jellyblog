/**
 * Created by mgordeev on 14.08.2014.
 */
define('show-full-content',
    [
        'jquery',
        'mobile-detection'
    ],
    function ($, mobileDetection) {
        var showSimple = function ($contentElement, newContent) {
                // for mobile devices
                $contentElement.html(newContent);
            },
            showSmooth = function ($contentElement, newContent) {
                // desktop devices - show with smooth animation
                var $fakeElement = $('<div>'),
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
                // button.hide();
                // transition to new height...
                $contentElement.height(newH);
                setTimeout(function () {
                    // clear height when transition done
                    $contentElement.height('');
                }, 1000);
            },
            showSmoothOrSimple = mobileDetection.deviceMobile ? showSimple : showSmooth,
            loadFullContent = function (id) {
                return $.get('/api/post', {
                    id: id
                });
            },
            onCommand = function (event) {
                var $this = $(this),
                    id = $this.data('cmd-show-full');

                $this.addClass('disabled');
                loadFullContent(id).done(function (result) {
                    var newContent = result.content.replace('%CUT%', ''),
                        $contentElement = $('div[data-post-content-id="' + id + '"]');

                    showSmoothOrSimple($contentElement, newContent);
                    $this.hide();
                }).always(function () {
                    $this.removeClass('disabled');
                });
            },
            bind = function () {
                $('div.main-wrapper').on('click', 'a[data-cmd-show-full]', onCommand);
            };

        return {
            bind: bind
        };
    });