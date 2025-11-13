const initialState = {
  search: "",
  sortKey: "id",
  sortOrder: "asc",
  currentPage: 0,
  itemsPerPage: 5,
 task: [], 
};
  
  const taskReducer = (state = initialState, action) => {
    switch (action.type) {
      case "SET_SEARCH_TERM":
        return { ...state, searchTerm: action.payload };
      case "SET_SORT":
        return { ...state, sortKey: action.payload.key, sortOrder: action.payload.order};
      case "SET_PAGINATION":
        return { ...state, currentPage: action.payload };
     case "ADD_TASK":
      return { ...state,
        task: [ ...action.payload]}
        default:
        return state;
    }
  };
  
  export default taskReducer;
  