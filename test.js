(function () {
    var newConfig = {'ttl' : 3600, 'prefix' : 'new_', 'version' : 2.3, 'wrongIndex' : false}
    scStorage.setConfig(newConfig);
    console.log('new configuration');
    console.log(scStorage.config);

    console.log('setting globals');
    scStorage.setGlobal('foo', 3);
    scStorage.setGlobal('bar', 5);
    scStorage.setGlobal('bar', 7, 'customNameSpace');

    console.log(scStorage.getGlobal('foo'));
    console.log(scStorage.getGlobal('foo', 'nonsens'));
    console.log(scStorage.getGlobal('bar'));
    console.log(scStorage.getGlobal('bar', 'customNameSpace'));

    console.log(scStorage.getAllGlobals());

    console.log('removing global vars');
    scStorage.removeGlobal('bar');
    scStorage.removeGlobal('notThere');
    scStorage.removeGlobal('hip', 'hop');
    scStorage.removeGlobal('bar', 'customNameSpace');
    console.log(scStorage.getAllGlobals());

})();