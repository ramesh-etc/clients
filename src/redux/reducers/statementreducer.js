const initialState = {
    search: "",
    sortKey : "id",
    setOrder : "asc",
    currentPage: 0,
    itemsPerPage: 3,
    statement : [],

};

const Statement = (state = initialState ,action)=>{
    switch (action.type){
        case "SET_SEARCH":
            return { ...state, search: action.payload, currentPage: 1 };
        case "SET_SORT":
      const newOrder =
        state.sortKey === action.payload && state.sortOrder === "asc"
          ? "desc"
          : "asc";
      return { ...state, sortKey: action.payload, sortOrder: newOrder };
      case "SET_PAGE":
        return { ...state, currentPage: action.payload };
    case "STATEMENT":
        return {
          ...state,
          statement: [ ...action.payload]
        };
        default:
            return state;    
    }
}

export default Statement;