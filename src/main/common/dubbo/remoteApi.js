import appCore       from '@/main/AppCore.js';


import TelnetInvoker from "@/main/common/dubbo/invoker/TelnetInvoker.js";
import JavaInvoker from "@/main/common/dubbo/invoker/JavaInvoker.js";
import InvokerAdapter from "./invoker/InvokerAdapter";

import paramGeneratorDubbo2_7 from '@/main/common/dubbo/generator/ParamGeneratorDubbo2_7';
import paramGeneratorDubbo3 from '@/main/common/dubbo/generator/ParamGeneratorDubbo3';
import ParamGeneratorAdapter from '@/main/common/dubbo/generator/ParamGeneratorAdapter';

const telnetInvoker = new TelnetInvoker();
const javaInvoker = new JavaInvoker();

appCore.registerInvoke('telnet', telnetInvoker);
appCore.registerInvoke('java', javaInvoker);
appCore.registerInvoke('adapter', new InvokerAdapter(javaInvoker, telnetInvoker));

appCore.registerParamGenerator('dubbo2.7', paramGeneratorDubbo2_7);
appCore.registerParamGenerator('dubbo3', paramGeneratorDubbo3);
appCore.registerParamGenerator('adapter', new ParamGeneratorAdapter(paramGeneratorDubbo2_7, paramGeneratorDubbo3));


export default []