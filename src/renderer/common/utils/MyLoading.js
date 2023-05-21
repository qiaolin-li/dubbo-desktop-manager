import { Loading } from 'element-ui';


function service(target, text, cancelText, cancelFunction){
    let loadingInstance = Loading.service({
        target: target,
        text: text,
        spinner: "0",
        background: 'rgba(0, 0, 0, 0.2)'
      });
    
      let button = document.createElement("input");
      button.type = "button";
      button.value = cancelText
      button.className = "cancel-button";
      button.addEventListener("click", () => {
        cancelFunction && cancelFunction();
      });
      loadingInstance.$el.firstElementChild.appendChild(button)
      return loadingInstance;
}


  export default {
    service  
}