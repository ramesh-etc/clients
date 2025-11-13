export const Details = (dash) => {
    return {
        type: 'SHOW_DATA',
        payload: dash,
    }
}

export const Searcharea = (search) => {
    return {
        type: 'SEARCH_DATA',
        payload: search,
    }
}

export const setPage = (page) => ({
    type: "SET_PAGE",
    payload: page,
});