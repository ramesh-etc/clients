export const ADD_TASK = "ADD_TASK";
export const setSearchTerm = (searchTerm) => ({
    type: "SET_SEARCH_TERM",
    payload: searchTerm,
  });
  
  export const setSort = (key, order) => ({
    type: "SET_SORT",
    payload: { key, order },
  });
  
  export const setPagination = (page) => ({
    type: "SET_PAGINATION",
    payload: page,
  });
  export const addTask = (task) => ({
    type: "ADD_TASK",
    payload: task,
  });