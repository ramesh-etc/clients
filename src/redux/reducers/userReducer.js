const initialState = {

        zuid: "",
        zaaid: "",
        org_id: "",
        status: "",
        is_confirmed:false ,
        email_id: "",
        last_name: "",
        first_name:"",
        created_time: "",
        role_details: { role_name: "", role_id: "" },
        user_type: "",
        user_id: "",
        locale: "",
        time_zone: "",
        project_profiles: []
      
  };
    
    const userReducer = (state = initialState, action) => {
      switch (action.type) {
        case "USER_DETAILS":
          return  action.payload
       
          default:
          return state;
      }
    };
    
    export default userReducer;