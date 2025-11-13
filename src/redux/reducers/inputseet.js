import { SET_FORM_FIELDS, SET_RESPONSE_DATA } from "../actions/inputsheet";

const initialState = {
  formFields: [],
  responseData: {},
};

export const formReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FORM_FIELDS:
      return { ...state, formFields: action.payload };
    case SET_RESPONSE_DATA:
      return { ...state, responseData: action.payload };
    default:
      return state;
  }
};
