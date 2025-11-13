export const SET_SEARCH = "SET_SEARCH";
export const SET_SORT = "SET_SORT";
export const SET_PAGE = "SET_PAGE";
export const STATEMENT = "STATEMENT";

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

export const statement = ()=> async  (dispatch) => {
  try {
    const response = await fetch("/api/applicators");
    const data = await response.json();
    dispatch({
      type: STATEMENT,
      payload: data,
    });
  } catch (error) {
    console.error("Error fetching applicators:", error);
  }
};


// export const fetchApplicators = () => async (dispatch) => {
//   try {
//     const response = await fetch("/api/applicators");
//     const data = await response.json();
//     dispatch({
//       type: ADD_APPLICATOR,
//       payload: data,
//     });
//   } catch (error) {
//     console.error("Error fetching applicators:", error);
//   }
// };