/**
 * Created by Gordeev on 27.07.2014.
 */
define('vm.edit-post',
    [
        'ko',
        'logger',
        'data.post',
        'model-state',
        'messenger'
    ],
    function (ko, logger, provider, ModelState, messenger) {
        var post = ko.observable(null),
            modelState = new ModelState(),
            urlPreview = ko.computed({
                read: function () {
                    var postUnwrapped = post();
                    if (!postUnwrapped) {
                        return null;
                    }
                    if (postUnwrapped.slug()) {
                        return '[host]/' + postUnwrapped.slug();
                    } else {
                        return '[host]/post?id=' + postUnwrapped._id;
                    }
                },
                deferEvaluation: true
            }),
            datePreview = ko.computed({
                read: function () {
                    var postUnwrapped = post();
                    if (!postUnwrapped) {
                        return null;
                    }
                    return postUnwrapped.date()
                },
                deferEvaluation: true
            }),
            saving = ko.observable(false),
            loading = ko.observable(false),
            saveButtonTitle = ko.observable('SAVE'),
            reloadButtonTitle = ko.observable('CANCEL_EDIT'),
            reloadDisabled = ko.computed({
                read: function(){
                    return loading() || modelState.pristine();
                },
                deferEvaluation: true
            }),
            saveDisabled = ko.computed({
                read: function () {
                    return saving() || modelState.pristine();
                },
                deferEvaluation: true
            }),
            updateViewData = function (newPostId) {
                if (newPostId) {
                    loading(true);
                    reloadButtonTitle('LOADING');
                    provider.get(newPostId)
                        .done(function (result) {
                            post(result);
                            modelState.setModel(result);
                        })
                        .always(function () {
                            loading(false);
                            reloadButtonTitle('CANCEL_EDIT');
                        });
                } else {
                    post(new provider.PostDetails());
                    modelState.setModel(post());
                }
            },
            activate = function (stateParams) {
                var postId;

                if (stateParams && stateParams.params && stateParams.params.postId) {
                    postId = stateParams.params.postId;
                }
                updateViewData(postId);
            },

            onPostSubmit = function (form) {
                if (form.checkValidity()) {
                    saveButtonTitle('SAVING');
                    saving(true);
                    provider.save(post())
                        .done(function (result) {
                            post(result);
                            modelState.setModel(result);
                            messenger.publish(messenger.messageNames.PostUpdated, result);
                        })
                        .always(function () {
                            saving(false);
                            saveButtonTitle('SAVE');
                        });
                }
            },
            reload = function () {
                var postUnwrapped = ko.unwrap(post),
                    id = postUnwrapped ? postUnwrapped._id : undefined;
                updateViewData(id);
            };

        return {
            activate: activate,
            post: post,
            urlPreview: urlPreview,
            contentPreview: ko.observable(false),
            save: {
                do: onPostSubmit,
                disabled: saveDisabled,
                title: saveButtonTitle
            },
            reload: {
                do: reload,
                disabled: reloadDisabled,
                title: reloadButtonTitle
            }
        };
    });