const initialState = {
  search: "",
  sortKey: "id",
  sortOrder: "asc",
  currentPage: 0,
  itemsPerPage: 10,
  applicators: [], // Store applicators
};

const applicatorReducer = (state = initialState, action) => {
  switch (action.type) {
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

    case "ADD_APPLICATOR":
      return {
        ...state,
        applicators: [...action.payload],
      };

    default:
      return state;
  }
};

export default applicatorReducer;
