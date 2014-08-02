/**
 * Created by Gordeev on 27.07.2014.
 */
define('vm.edit-post',
    [
        'ko',
        'logger',
        'data.post'
    ],
    function (ko, logger, provider) {
        var currentPostId = ko.observable(undefined),
            post = ko.observable(null),
            urlPreview = ko.computed({
                read: function(){
                    var postUnwrapped = post();
                    if(!postUnwrapped){
                        return null;
                    }
                    if(postUnwrapped.slug()){
                        return '[host]/'+postUnwrapped.slug();
                    }else{
                        return '[host]/post?id='+postUnwrapped._id;
                    }
                },
                deferEvaluation: true
            }),
            datePreview = ko.computed({
                read: function(){
                    var postUnwrapped = post();
                    if(!postUnwrapped){
                        return null;
                    }
                    return postUnwrapped.date()
                },
                deferEvaluation: true
            }),
            updateViewData = function (newPostId) {
                if(newPostId){
                    provider.get(newPostId)
                        .done(function(result){
                            post(result);
                        });
                }else{
                    post(new provider.PostDetails());
                }
            },
            activate = function (stateParams) {
                var postId;

                if(stateParams && stateParams.params && stateParams.params.postId){
                    postId = stateParams.params.postId;
                }
                currentPostId(postId);
            },

            onPostSubmit=function(form){
                logger.log(form.checkValidity());
                logger.log(form);
            },
            remove=function(){
                slert('remove');
            };

        currentPostId.subscribe(updateViewData);

        return {
            activate: activate,
            post: post,
            onPostSubmit: onPostSubmit,
            remove: remove,
            urlPreview: urlPreview
        };
    });