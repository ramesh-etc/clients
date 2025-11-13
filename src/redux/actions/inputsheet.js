export const SET_FORM_FIELDS = "SET_FORM_FIELDS";
export const SET_RESPONSE_DATA = "SET_RESPONSE_DATA";

export const setFormFields = (fields) => ({
  type: SET_FORM_FIELDS,
  payload: fields,
});

export const setResponseDatas = (data) => ({
  type: SET_RESPONSE_DATA,
  payload: data,
});
