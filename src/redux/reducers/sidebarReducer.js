const initialState = {
    isSidebarShrunk: false, 
  };
  
  const sidebarReducer = (state = initialState, action) => {
    switch (action.type) {
      case "TOGGLE_SIDEBAR":
        return { ...state, isSidebarShrunk: !state.isSidebarShrunk };
      default:
        return state;
    }
  };
  
  export default sidebarReducer;
  