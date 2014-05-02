/**
 * Created by Gordeev on 01.05.2014.
 */
requirejs(["ko", "vm.admin"],
    function (ko, vmAdmin) {
        console.log("main.admin started");
        ko.applyBindings(vmAdmin);
    });