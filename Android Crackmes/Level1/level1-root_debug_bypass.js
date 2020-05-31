if (Java.available) {
    Java.perform(function () {
        var class_c = Java.use('sg.vantagepoint.a.c');
        //a()
        class_c.a.implementation = function () {
            return false
        };
        //b()
        class_c.b.implementation = function () {
            return false
        };
        //c()
        class_c.c.implementation = function () {
            return false
        };

        var class_b = Java.use('sg.vantagepoint.a.b');
        //b()
        class_b.a.implementation = function () {
            return false
        };
    });
}