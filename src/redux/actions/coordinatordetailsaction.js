export const Datelist = (list) =>{
    return{
        type:'SHOW_DATELIST',
        payload:list
    }
}

export const Seracharea = ( searchtable)=>{
    return{
        type:'SEARCH_TABlE',
        payload:searchtable
    }
}