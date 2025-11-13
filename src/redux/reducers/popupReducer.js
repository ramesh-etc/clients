const initialState = {
  isPopupOpen: false,
};

const popupReducer = (state = initialState, action) => {
  switch (action.type) {
    case "TOGGLE_POPUP":
      return { ...state, isPopupOpen: !state.isPopupOpen };
    default:
      return state;
  }
};

export default popupReducer;
