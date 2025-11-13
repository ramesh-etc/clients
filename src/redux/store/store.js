import { createStore, combineReducers, applyMiddleware } from "redux";
import sidebarReducer from "../reducers/sidebarReducer";
import taskReducer from "../reducers/taskReducer";
import applicatorReducer from "../reducers/applicatorReducer";
import popupReducer from "../reducers/popupReducer";
import projectcoordinatorreducer from "../reducers/projectcoordinatorreducer";
import coordinatordetails from "../reducers/coordinatordetailsreducer";
import userReducer from "../reducers/userReducer";
import Statement from "../reducers/statementreducer";
import { invoiceReducer } from "../reducers/invoiceReducer";
import { formReducer } from "../reducers/inputseet";
import { thunk } from "redux-thunk";
import userpermission from "../reducers/userpermissionreducre";

const rootReducer = combineReducers({
  sidebar: sidebarReducer,
  tasks: taskReducer,
  applicator: applicatorReducer,
  popup: popupReducer,
  projectcoordinator: projectcoordinatorreducer,
  coordinatordetails: coordinatordetails,
  user: userReducer,
  statement: Statement,
  invoice: invoiceReducer,
  form: formReducer,
  userpermission:userpermission
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
