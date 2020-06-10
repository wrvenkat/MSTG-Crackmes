
function hookViewDidLoad() {
    const viewDidLoad = ObjC.classes.ViewController['- viewDidLoad'];
    const viewDidLoadImpl = viewDidLoad.implementation;

    viewDidLoad.implementation = ObjC.implement(viewDidLoad, function (handle, selector) {
        console.log("Hooking viewDidLoad");
        return;
    });
}

function hookAbc() {
    const abc = ObjC.classes.ViewController['- abc'];
    const abcImpl = abc.implementation;

    abc.implementation = ObjC.implement(abc, function (handle, selector) {
        console.log("Hooking abc");
        return;
    });
}

function hookHandleButtonClick() {
    const handleButtonClick = ObjC.classes.ViewController['- handleButtonClick:'];
    const handleButtonClickImpl = handleButtonClick.implementation;

    Interceptor.attach(handleButtonClick.implementation, {
        onEnter: function (args) {
            console.log("Inside handleButtonClick()");
        },
        onExit: function (retval) {
            console.log("exiting handleButtonClick()");
        }
    });
}

function hookAESDecrypt() {
    const decrypt = ObjC.classes.AESCrypt['+ decrypt:password:'];
    const decryptImpl = decrypt.implementation;
    
    /*decrypt.implementation = ObjC.implement(decrypt, function (handle, selector) {
        console.log("Replacement for [AES decrypt]");
        // console.log("Key: "+ObjC.Object(args[3]));
        return 0;
    });*/

    Interceptor.attach(decryptImpl, {
        onEnter: function (args) {
            console.log("[AESCrypt decrypt:password:] Key: "+ObjC.Object(args[3]));
        },
        onLeave: function (retval) {
            console.log("[AESCrypt decrypt:password:] RetvalL: "+retval);
            writeToSplLocation();
            var NSString = ObjC.classes.NSString;
            var nsStr = NSString.stringWithString_("Hello World");
            retval.replace(nsStr);
            console.log("Solution string is: "+nsStr);
        }
    });
}

function writeToSplLocation() {
    const splLocationOffset = ptr(0xe190);
    const execBaseAddress = getExecBaseAddress();
    var splLocationAddress = execBaseAddress.add(splLocationOffset);

    var val = splLocationAddress.readByteArray(1);

    var u8 = new Uint8Array(val);
    var arrayBufContent = '';
    for (var i=0; i < u8.length; i++)
        arrayBufContent += u8[i].toString(16)+' ';
    console.log("Spl location at address: "+splLocationAddress+" has value: "+arrayBufContent);

    splLocationAddress.writeByteArray([0x0]);
    console.log("Spl location at address: "+splLocationAddress+" written with 0x0");
}

function hookStringWithCString() {
    const stringWithCString = ObjC.classes.NSString['+ stringWithCString:encoding:'];
    Interceptor.attach(stringWithCString.implementation, {
        onEnter: function(args) {
            console.log("NSString stringWithCString");
        }
    });
}

function getExecBaseAddress() {
    var modules = Process.enumerateModulesSync();

    for (var i = 0; i < modules.length; i++) {
        if (modules[i].name.includes("UnCrackable Level 2")) {
            console.log("Exec loaded at: "+modules[i].base);
            return modules[i].base;
        }
    }

    return 0x0;
}

function hookEncrypt() {
    const encrypt = ObjC.classes.AESCrypt['+ encrypt:password:'];
    const encryptImpl = encrypt.implementation;

    Interceptor.attach(encryptImpl, {
        onEnter: function (args) {
            console.log("[AESCrypt encrypt:password:] Key: "+ObjC.Object(args[3]));
        },
        onLeave: function (retval) {
            console.log("[AESCrypt encrypt:password:] RetvalL: "+retval);
            retval.replace(nsStr);
        }
    });
}

function hookSplFunction2() {
    var funcAddress = 0x0;
    const funcOffset = ptr(0x5268);
    var execBaseAddress = getExecBaseAddress();

    funcAddress = execBaseAddress.add(funcOffset);
    console.log("SplFunction at address: "+funcAddress);

    const splFunctionImpl = funcAddress.implementation;
    const splFunction = new NativeFunction(funcAddress, 'int', ['pointer']);
    
    Interceptor.replace(splFunction, new NativeCallback( function (addr) {
        console.log("Inside splFunction()");
        console.log("Returning early");
        return 0;
    }, 'int', ['pointer']));

    /*Interceptor.attach(funcAddress, {
        onEnter: function (args) {
            console.log("Inside splFunction1()");
            console.log("Returning early");
            return 0;
        },
        onExit: function (retval) {
            console.log("Returning from splFunction()");
        }
    });*/
}

function hookSplFunction() {
    var funcAddress = 0x0;
    const funcOffset = ptr(0x5268);
    var execBaseAddress = getExecBaseAddress();

    funcAddress = execBaseAddress.add(funcOffset);
    console.log("SplFunction at address: "+funcAddress);

    const splFunction = new NativeFunction(funcAddress, 'int', ['pointer']);
    const splFunctionImpl = splFunction.implementation;
    splFunction.implementation = function(args) {
        console.log("Returning early from function @ offset "+funcOffset);
        return 0;
    }
}

hookViewDidLoad();

/*Not called */
hookAbc();
hookSplFunction2();
hookAESDecrypt();

/*Not called */
hookEncrypt();
hookHandleButtonClick();
//hookStringWithCString();