import React,{useEffect} from 'react'

function SalesIqBot() {
   useEffect(() => {

    window.$zoho = window.$zoho || {};
    window.$zoho.salesiq = window.$zoho.salesiq || { ready: function () {} };
    if (document.getElementById("zsiqscript")) {
      console.log("Zoho SalesIQ script already loaded");
      return;
    }
    
    const externalScript = document.createElement("script");
    externalScript.id = "zsiqscript";
    externalScript.src =
      "https://salesiq.zohopublic.in/widget?wc=siqfd14f1806d4f07fa39df0fa7ef5f94fd0914966b0a650c3b6ad7dac898e09a55c25ca4f4b89723076989ce3dce28ba18"
    externalScript.defer = true;


    externalScript.onload = () => {
      console.log("Zoho SalesIQ script loaded successfully");
    };

    externalScript.onerror = () => {
      console.error("Failed to load Zoho SalesIQ script");
    };

    document.body.appendChild(externalScript);
    return () => {
      const scriptElement = document.getElementById("zsiqscript");
      // if (scriptElement) {
      //   document.body.removeChild(scriptElement);
      // }
      if (scriptElement && scriptElement.parentNode === document.body) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  return null;
};

export default SalesIqBot
