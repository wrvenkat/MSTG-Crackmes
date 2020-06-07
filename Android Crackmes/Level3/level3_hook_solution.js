function System_loadLibrary() {
    if (Java.available) {
        Java.perform(function () {
            const Runtime = Java.use('java.lang.Runtime');
            const VMStack = Java.use('dalvik.system.VMStack');
            const System = Java.use('java.lang.System');
            
            System.loadLibrary.implementation = function (libName) {
                var currRuntime = Runtime.getRuntime();
                var currClassLoader = VMStack.getCallingClassLoader();
                
                try {
                    currRuntime.loadLibrary0(currClassLoader, libName);
                    console.log("loadLibrary() called with: "+libName);
                    console.log("")
                    enumerateModuleProperties(libName);
                }
                catch (ex) {
                    console.log(ex)
                }
            };
        });
    }
}

function enumerateModuleProperties(libName) {
    if (libName === null || libName == undefined)
        console.log("enumerateModuleProperties: no module name provided");

    var loadedModules = Process.enumerateModules();
    var baseAddress = null;

    for (var i = 0; i < loadedModules.length; i++) {
        if (loadedModules[i].name.includes(libName)) {
            var exports = loadedModules[i].enumerateExports();

            var name = loadedModules[i].name;
            baseAddress = loadedModules[i].base;
            console.log("Base address: "+ baseAddress+" Name: "+name )
            // also hook the function @ 0x10e0 relative to the base
            hookSplFunction(baseAddress)
        }
    }
    console.log("");

    console.log("Exports of: "+libName)
    for (var i=0; i < exports.length; i++) {
        var name = exports[i].name;
        var address = exports[i].address;
        console.log(address+ " "+
                    address.sub(baseAddress)+" "+
                    "Name: "+ name
        );

        // try to hook goodbye()
        so_goodbye_hook(name, address);        
    }
    console.log("");
}

function fopen_hook() {
    const fopen = Module.getExportByName(null, 'fopen');
    Interceptor.attach(fopen, {
        onEnter: function (args) {
            console.log("fopen() called with: "+args[0].readCString());
            console.log('fopen called from:\n' +
                Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(DebugSymbol.fromAddress).join('\n') + '\n');
            console.log("")
        }
    });
}

function strstr_hook() {
    const strstr = Module.getExportByName(null, 'strstr');

    const enable_logging = false;
    const enable_goodbye = false;
    //prematurely force triggering goodbye() instead of taking the natural flow
    const force_goodbye = false;

    /**
     * create a C string 'frida' or 'brida'
     */
    const dummy_str = Memory.alloc(6);
    //0x66 == 'f' 0x62 == 'b'
    dummy_str.writeByteArray([0x62, 0x72, 0x69, 0x64, 0x61, 0x0])
    console.log("Dummy Str is: "+ dummy_str.readCString())

    Interceptor.attach(strstr, {
        onEnter: function (args) {
            this.hstack = args[0].readCString();
            this.needle = args[1].readCString();

            /**
             * If the string is 'frida', then replace what is being compared with
             * our own stupid string.
             * This will cause the while (pcVar3 == NULL) check inside FUN_001030d0()
             * which is running in a separate thread to pass, forcing the while to run forever.
             * 
             * This is another way of not triggering goodbye(), enable if needed.
             */

            /*if (needle == 'frida') {
                args[1] = dummy_str
                console.log("strstr() Needle after change: "+args[1].readCString());
            }*/
        },
        onLeave: function (retval) {
            if (enable_logging) {                
                if (this.hstack.includes('frida') || this.hstack.includes('xposed')) {
                    console.log("strstr() Needle: "+this.needle);
                    console.log("strstr() HStack: "+this.hstack);
                }
            }

            /**
             * enabling the following will cause the while (pcVar3 == NULL) check inside
             * FUN_001030d0() which is running in a separate thread to fail, which will 
             * end up triggering goodbye()
             */
            if (enable_goodbye && force_goodbye)
                retval.replace(dummy_str)

            /**
             * the following will cause the while (pcVar3 == NULL) check inside FUN_001030d0()
             * which is running in a separate thread to pass, forcing the while to run forever
             */
            if (!enable_goodbye)
                retval.replace(ptr(0x0))
        }
    });
}

function so_goodbye_hook(exportName, exportAddress) {
    if (exportName == null || exportName == undefined
        || !exportName.includes('goodbye')) return

    console.log("goodbye() found! hooking....");
    //const so_goodbye = Module.getExportByName(null, '_Z7goodbyev');
    Interceptor.attach(exportAddress, {
        onEnter: function (args) {
            console.log('_Z7goodbyev called from:\n' +
                Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(DebugSymbol.fromAddress).join('\n') + '\n');
        }
    });
}

function jni_init(enable) {
    if (!enable) return;

    const jnit_init_f = Module.getExportByName(null, 'Java_sg_vantagepoint_uncrackable3_MainActivity_init');
    Interceptor.attach(jnit_init_f, {
        onEnter: function (args) {
            console.log('Java_sg_vantagepoint_uncrackable3_MainActivity_init() called from:\n' +
                Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(DebugSymbol.fromAddress).join('\n') + '\n');
        }
    });
}

function showDialogHook() {
    if (Java.available) {
        Java.perform(function () {
            const MainActivity = Java.use('sg.vantagepoint.uncrackable3.MainActivity');
            MainActivity.showDialog.implementation = function (dialogString) {
                console.log("showDialog() called with string: "+dialogString);
                
                // the following calls the original
                //return this.showDialog(dialogString);
            }
        });
    }
}

function hookSplFunction(baseAddress) {
    // get the runtime address of 0x10e0 in the module
    const relAddress = ptr(0x10e0);
    const properAddress = baseAddress.add(relAddress);
    console.log("Address of FUN_001010e0(): "+properAddress);

    const key = 'pizzapizzapizzapizzapizzapizz';

    Interceptor.attach(properAddress, {
        onEnter: function (args) {
            this.splAddress = args[0];
        },
        onLeave: function (retval) {
            var arrayBuffer = this.splAddress.readByteArray(0x18);
            console.log("SplValue: Lenghth: "+arrayBuffer.byteLength);
            console.log(hexdump(arrayBuffer,{
                offset: 0,
                length: 24,
                header: false,
                ansi: false
            }));

            var u8 = new Uint8Array(arrayBuffer);
            var arrayBufContent = ''
            for (var i=0; i < u8.length; i++)
                arrayBufContent += u8[i].toString(16)+' ';
            console.log("splValue: "+arrayBufContent);
            
            // we now try to get the input by xoring
            var inputVal = ''
            for (var i=0; i < u8.length; i++) {
                var res = key.charCodeAt(i) ^ u8[i];
                inputVal += String.fromCharCode(res);
            }
            console.log("Input val: "+inputVal);
        }
    });
}

/**
 * enable if needed
 */
//fopen_hook()
strstr_hook();
System_loadLibrary();
showDialogHook();