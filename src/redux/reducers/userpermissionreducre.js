const initialState = {
    permissiondata: []
  };
  
  const userpermission = (state = initialState, action) => {
    switch (action.type) {
      case "USER_PERMISSION":
        return {
          ...state,
          permissiondata: action.payload
        };
      default:
        return state;
    }
  };
  
  export default userpermission;
  