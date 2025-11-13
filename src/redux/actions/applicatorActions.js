export const SET_SEARCH = "SET_SEARCH";
export const SET_SORT = "SET_SORT";
export const SET_PAGE = "SET_PAGE";
export const ADD_APPLICATOR = "ADD_APPLICATOR";

export const setSearch = (search) => ({
  type: SET_SEARCH,
  payload: search,
});

export const setSort = (key) => ({
  type: SET_SORT,
  payload: key,
});

export const setPage = (page) => ({
  type: SET_PAGE,
  payload: page,
});

export const addApplicator = (applicator) => ({
  type: ADD_APPLICATOR,
  payload: applicator,
});
