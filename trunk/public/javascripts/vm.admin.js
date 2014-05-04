/**
 * Created by Gordeev on 01.05.2014.
 */
define(["jquery", "ko", "underscore", "model.user"], function ($, ko, _, modelUser) {
    var userList = ko.observableArray(),
        editedUser = ko.observable(null),
        init = function () {
            modelUser.getList(function (error, result) {
                if (!error) {
                    userList(result);
                }
            });

        },
        edit = function () {
            var cloneForEdit = this.clone();
            editedUser(cloneForEdit);
        },
        remove = function () {
            this.delete(function(error, result){
                var finded;
                if(!error){
                    finded= _.find(userList(), function(item){
                        return item.id()===result.id();
                    });
                    if(finded){
                        userList.remove(function(item){
                            return item.id()===finded.id();
                        })
                    }
                }else{
                    alert(error);
                }
            });
        },
        create = function () {
            var newModel=new modelUser.ModelUser();
            editedUser(newModel);
        },
        editOK = function () {
            if(!this.allValid()){
                return;
            }
            this.update(function (error, result) {
                var finded;
                if (!error) {
                    finded = _.find(userList(), function (item) {
                        return item.id() === result.id();
                    });
                    if (finded) {
                        finded.fullname(result.fullname());
                        finded.username(result.username());
                    } else {
                        userList.push(result);
                    }
                } else {
                    alert(error && error.err);
                }
                editedUser(null);
            });
        },
        editCancel = function () {
            editedUser(null);
        };

    init();

    return{
        userList: userList,
        edit: edit,
        remove: remove,
        create: create,
        editedUser: editedUser,
        editOK: editOK,
        editCancel: editCancel
    };
});