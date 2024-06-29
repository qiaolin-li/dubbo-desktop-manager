

class InvokerAdapter {

    constructor(javaInvoker, telnetInvoker) {
        this.javaInvoker = javaInvoker;
        this.telnetInvoker = telnetInvoker;
    }

    invokeMethod(provder, methodInfo, code, invokerType) {
        if (invokerType === "telnet") {
            return this.telnetInvoker.invokeMethod(provder, methodInfo, code);
        }
        return this.javaInvoker.invokeMethod(provder, methodInfo, code);
    }

}

export default InvokerAdapter;