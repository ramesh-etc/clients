

const initial = {
    datelist: [
        {
            "demoDate": {
                "CREATORID": "10152000000007006",
                "out_time": "2025-02-01 08:01:01",
                "MODIFIEDTIME": "2025-02-20 00:03:38:079",
                "in_time": "2025-02-01 08:00:00",
                "location": "Salem",
                "CREATEDTIME": "2025-02-20 00:03:38:079",
                "ROWID": "10152000000040859"
            }
        },
        {
            "demoDate": {
                "CREATORID": "10152000000007006",
                "out_time": "2025-02-02 08:01:01",
                "MODIFIEDTIME": "2025-02-20 00:03:38:079",
                "in_time": "2025-02-02 08:01:00",
                "location": "Erode",
                "CREATEDTIME": "2025-02-21 00:03:38:079",
                "ROWID": "10152000000040859"
            }
        },
        {
            "demoDate": {
                "CREATORID": "10152000000007006",
                "out_time": "2025-03-01 08:01:01",
                "MODIFIEDTIME": "2025-02-20 00:03:38:079",
                "in_time": "2025-03-01 08:01:00",
                "location": "Erode",
                "CREATEDTIME": "2025-02-21 00:03:38:079",
                "ROWID": "10152000000040859"
            }
        },
        {
            "demoDate": {
                "CREATORID": "10152000000007006",
                "out_time": "2025-03-02 08:01:01",
                "MODIFIEDTIME": "2025-02-20 00:03:38:079",
                "in_time": "2025-03-02 08:01:00",
                "location": "Erode",
                "CREATEDTIME": "2025-02-21 00:03:38:079",
                "ROWID": "10152000000040859"
            }
        },
        {
            "demoDate": {
                "CREATORID": "10152000000007006",
                "out_time": "2025-01-01 08:01:01",
                "MODIFIEDTIME": "2025-02-20 00:03:38:079",
                "in_time": "2025-01-01 08:01:00",
                "location": "Erode",
                "CREATEDTIME": "2025-02-21 00:03:38:079",
                "ROWID": "10152000000040859"
            }
        },
        
        {
            "demoDate": {
                "CREATORID": "10152000000007006",
                "out_time": "2025-01-02 08:01:01",
                "MODIFIEDTIME": "2025-02-20 00:03:38:079",
                "in_time": "2025-01-02 08:01:00",
                "location": "Erode",
                "CREATEDTIME": "2025-02-21 00:03:38:079",
                "ROWID": "10152000000040859"
            }
        },
    ],
    searchtable:"",
    sortkey:"id",
    sortorder:"asc"
}

const coordinatordetails = (state = initial,action)=>{
    switch(action.type){
        case "SHOW_DATELIST":
            return {
                ...state,
                datelist:[...state.datelist]
            }
        case "SEARCH_TABlE" :
            return{
                ...state,
                searchtable:action.payload
            }   
        default:
            return state;    
    }
}

export default coordinatordetails;