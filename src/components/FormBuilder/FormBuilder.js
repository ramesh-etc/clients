import $ from "jquery";
import React, { Component, createRef} from "react";
import ReactDOM from "react-dom";
import './FormBuilder.css';
import "bootstrap/dist/css/bootstrap.min.css";
// const axios = require('axios');
import axios from "axios";
import { Button } from "bootstrap";
import { useNavigate, withRouter } from "react-router-dom";
import Swal from 'sweetalert2';


window.jQuery = $;
window.$ = $;

require("jquery-ui-sortable");
require("formBuilder");
require("formBuilder/dist/form-render.min.js");

const formData = [
  {
    type: "header",
    subtype: "h1",
    label: "formBuilder in React",
  },
];


export class FormBuilder extends Component {
  fb = createRef();
  state = {
    jsonOutput: "",
    htmlOutput: "",
    htmlCode:"",
    preview: true,
    length: 0,
    formViewData: [],
    formviewvisable: false,
    formValues: {},
    formValuesJson: "",
    formStructure: [],
    submit:false,
    milestone_id: "",
    email_id: "",
  };



 handleSubmit = () => {

     this.setState({
        submit: true
      });
    const formValues = {};
    const fields = document.querySelectorAll("#fb-editor textarea");
    fields.forEach((field) => {
      console.log("fields", field.text);
      formValues[field.name] = field.value;
    });

  console.log("jSOnOutput",this.state.jsonOutput);

  let jsonData = this.state.jsonOutput;
  if (typeof jsonData === 'string') {
    try {
      jsonData = JSON.parse(jsonData); 
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }

  if (!this.state.email_id || !this.state.milestone_id) {
  Swal.fire("Please fill both Email ID and Milestone ID");
  return;
}

  console.log("..............", jsonData);
  const payload = {
    email: this.state.email_id,
    milestone_id : this.state.milestone_id,
    form: jsonData, 
  };

  console.log("payload",payload);
  axios
  .post("/server/elite_tech_corp_function/add/input-requirments", payload)
  .then((response) => {
    console.log("Form submitted successfully:", response.data);
    Swal.fire("Form Submitted successfully!");
    this.formBuilder.actions.clearFields();
  })
  .catch((error) => {
    console.error("There was an error submitting the form:", error);
     Swal.fire("here was an error submitting the form Try Again")
  }).finally(() => {
        this.setState({
            submit: false,
            preview: false,

        });
        if (this.formBuilder) {
      this.formBuilder.actions.clearFields();
    }
  });
};

  handleClose = () =>{
  this.setState({
        preview: false
      });
};

//   handleNavigate = () => {
//     window.location.href = "#/ShowForm";
//   };


  componentDidMount() {
      if (!this.formBuilder) {
    this.formBuilder = $(this.fb.current).formBuilder({
      formData: this.state.formData,
      controlPosition: "left",
      disableFields: ["autocomplete", "button", "date", "file", "hidden", "radio-group","paragraph", "select", "starRating", "header"],
    });
    console.log($(".option-value"));
    console.log($(".option-value").length);
    }
  }

  
  
  getFormData = () => {
    if (this.formBuilder) {
      let jsonOutput = this.formBuilder.actions.getData();
      jsonOutput = jsonOutput.map((field, index) => {
        field.name = field.label;  
  
        return {
          ...field,
          id: `custom_form_${(index + 1).toString().padStart(2, "0")}`
        };
      });

      console.log("json", jsonOutput);
      if (jsonOutput.length > 0) {
        this.setState({ length: jsonOutput.length, formStructure: jsonOutput });
      }
      const formContainer = document.createElement("div");
      $(formContainer).formRender({ formData: jsonOutput });
      const htmlOutput = formContainer.innerHTML;
      console.log("html code", htmlOutput);
      let htmlData = jsonOutput
        .map((field) => {
          switch (field.type) {
            case "text":
              return `<label>${field.label}</label>
                      <input type="${field.subtype || 'text'}" className="${field.className}" id="${field.id}"
                             name="${field.name}" value="${field.value || ''}" /><br/>`;

            case "number":
              return `<label>${field.label}</label>
                      <input type="number" className="${field.className}" name="${field.name}" id="${field.id}" /><br/>`;

            case "email":
              return `<label>${field.label}</label>
                      <input type="email" className="${field.className}" name="${field.name}"id="${field.id}" /><br/>`;

            case "password":
              return `<label>${field.label}</label>
                      <input type="password" className="${field.className}" name="${field.name}" id="${field.id}"/><br/>`;

            case "date":
              return `<label>${field.label}</label>
                      <input type="date" className="${field.className}" name="${field.name}" required id="${field.id}" /><br/>`;

            case "file":
              return `<label>${field.label}</label>
                      <input type="file" className="${field.className}" name="${field.name}" required id="${field.id}"/><br/>`;

            case "textarea":
              return `<label>${field.label}</label>
                      <textarea className="${field.className}" name="${field.name}" id="${field.id}"></textarea><br/>`;

            case "select":
              return `<label>${field.label}</label>
                      <select className="${field.className}" name="${field.name} " id="${field.id}">
                        ${field.values
                          .map(
                            (option) =>
                              `<option value="${option.value}" ${option.selected ? "selected" : ""
                              }>${option.label}</option>`
                          )
                          .join("")}
                      </select><br/>`;

            case "checkbox-group":
              return `<label>${field.label}</label><br/>
                      ${field.values
                        .map(
                          (option) =>
                            `<input type="checkbox" name="${field.name}" value="${option.value}" 
                            ${option.selected ? "checked" : ""} className="${field.className}" id="${field.id}"/>
                             <label>${option.label}</label><br/>`
                        )
                        .join("")}`;

            case "radio-group":
              return `<label className="${field.className}">${field.label}</label><br/>
                      ${field.values
                        .map(
                          (option) =>
                            `<input type="radio" name="${field.name}" value="${option.value}" id="${field.id}"/>
                             <label>${option.label}</label><br/>`
                        )
                        .join("")}`;

            case "autocomplete":
              return `<label>${field.label}</label>
                      <input type="text" className="${field.className}" name="${field.name}" id="${field.id}" placeholder="${field.placeholder}" list="datalist-${field.name}" required />
                      <datalist id="${field.id}" name="datalist-${field.name}">
                        ${field.values
                          .map(
                            (option) =>
                              `<option value="${option.value}">${option.label}</option>`
                          )
                          .join("")}
                      </datalist><br/>`;

            case "button":
              return `<button className =" ${field.className}" name="${field.name}" id="${field.id}" type="${field.subtype || "button"}">${field.label}</button><br/>`;

            case "header":
              return `<${field.subtype} className =" ${field.className}" id="${field.id}">${field.label}</${field.subtype}>`;

            case "paragraph":
              return `<p className =" ${field.className}" id="${field.id}">${field.label}</p>`;

            case "hidden":
              return `<input type="hidden" className =" ${field.className}" name="${field.name}" value="${field.value || ''}" id="${field.id}"/>`;

            default:
              return "";
          }
        })
        .join("");

      console.log("backend send data",htmlData);
      this.setState({
        jsonOutput: JSON.stringify(jsonOutput, null, 2),
        htmlOutput,
        htmlCode:htmlData,
        preview: true
      });
    }
  };

  clearForm = () => {
    if (this.formBuilder) {
      this.formBuilder.actions.clearFields();
    }

    this.setState({
      jsonOutput: "",
      htmlOutput: "",
      length: 0,
      formStructure: []
    });
  };


  handleSave = () => {
    const formStructure = [...this.state.formStructure];
  
    const formElements = document.querySelectorAll(".form-view input, .form-view textarea, .form-view select");
    
    const valueMap = {};
    
    formElements.forEach((element) => {
      if (element.name) {
        if (element.type === "checkbox" || element.type === "radio") {
          if (element.checked) {
            if (!valueMap[element.name]) {
              valueMap[element.name] = [];
            }
            valueMap[element.name].push(element.value);
          }
        } else {
          valueMap[element.name] = element.value;
        }
      }
    });
    
    const updatedFormStructure = formStructure.map(field => {
      const updatedField = { ...field };
      
      if (field.type === "checkbox-group" || field.type === "radio-group") {
        if (valueMap[field.name] && updatedField.values) {
          updatedField.values = updatedField.values.map(value => ({
            ...value,
            selected: valueMap[field.name].includes(value.value)
          }));
        }
      } else if (field.type === "select") {
        if (valueMap[field.name] && updatedField.values) {
          updatedField.values = updatedField.values.map(option => ({
            ...option,
            selected: option.value === valueMap[field.name]
          }));
        }
      } else {
        if (valueMap[field.name] !== undefined) {
          updatedField.value = valueMap[field.name];
        }
      }
      
      return updatedField;
    });
    
    const formValuesJson = JSON.stringify(updatedFormStructure, null, 2);
    
    this.setState({
      formValuesJson,
      formValues: valueMap
    });
  };

  render() {
    return (
      <div className="flex bg-gray-100 p-4">
        {/* Form Builder on Left */}
        <div className="w-full bg-white p-4 rounded-md shadow-md">
          <div className="alert alert-info mb-4 bg-white font-bold fs-24">User Form Data</div>
          <div className="flex flex-row gap-10 pl-4 pr-4">
            <div className="mb-4 w-1/2">
                <label className="block font-semibold mb-2">Milestone ID</label>
                <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={this.state.milestone_id}
                onChange={(e) => this.setState({ milestone_id: e.target.value })}
                />
            </div>

            <div className="mb-4 w-1/2">
                <label className="block font-semibold mb-2">Email ID</label>
                <input
                type="email"
                className="w-full border border-gray-300 rounded p-2"
                value={this.state.email_id}
                onChange={(e) => this.setState({ email_id: e.target.value })}
                />
            </div>
          </div>
           
          <div id="fb-editor" ref={this.fb} />
          <div className="buttons">
            <button
              onClick={this.getFormData}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            >
              Preview
            </button>
            <button
              onClick={this.clearForm}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear
            </button>
          </div>

        </div>
        <div className="w-1/3 bg-white p-4 ml-4 rounded-md shadow-md flex flex-col">
          <div className="preview-header flex flex-row justify-between">
            <h2 className="text-lg font-bold mt-4 mb-2 text-[20px]">Form Preview</h2>
          </div>

          {this.state.preview &&this.state.htmlOutput ?(
            <div className="preview-body flex justify-center align-middle flex-col">
              <div
                className="bg-gray-200 p-2 overflow-auto text-sm"
                dangerouslySetInnerHTML={{ __html: this.state.htmlOutput }}
              />
              <div className="flex justify-around flex-row pt-[5%]">
                <button
                  className="bg-success text-white p-2 border w-[35%] rounded-lg"
                  onClick={this.handleSubmit}
                >
                 {this.state.submit ?"submitting...":"Submit"}
                </button>
                <button className="bg-danger  text-white  p-2 border w-[35%] rounded-lg"
                onClick={this.handleClose}>Cancel</button>
              </div>
            </div>
          ):(
            <div className="flex justify-center text-[grey]">
              <p>No form generated</p>
            </div>
          )}
          

        </div>
        {this.state.formviewvisable && (
          <div className="w-1/3 bg-white p-4 ml-4 rounded-md shadow-md">
            <div className="preview-header">
              <h2 className="text-lg font-bold mt-4 mb-2 text-[20px]">Form View</h2>
              <div
                className="form-view bg-gray-200 p-2 overflow-auto text-sm"
                dangerouslySetInnerHTML={{ __html: this.state.formViewData }}>
              </div>
              <div className="pt-[5%]">
                <button
                  className="btn-success p-2 border w-[35%] rounded-lg"
                  onClick={this.handleSave}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-bold">Saved Data</h3>
              {this.state.formValuesJson ? (
                <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-150">
                  {this.state.formValuesJson}
                </pre>
              ) : (
                <p className="text-gray-500">No data saved yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
