import { SET_INVOICE_DATA } from "../actions/invoicedetails";

const initialState = {
  invoices: [],
};

export const invoiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_INVOICE_DATA:
      return {
        ...state,
        invoices: action.payload,
      };
    default:
      return state;
  }
};
