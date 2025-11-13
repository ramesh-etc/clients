const initialState ={
    dash: [
        {
            id:"1",
            no:'1',
            contractor:"suriya",
            applicators:"8",
            Applicator:[
                {name: "Surya"},
                {name: "Gowtham"},
                {name: "kalai"},
            ]       
        },
        {
            id:"2",
            no:'2',
            contractor:"gowtham",
            applicators:'6',
            Applicator:[
                {name:"vicky"},
                {name:'suriya'},
                {name:'vinoth'}
            ]
        
        },
        {
            id:"3",
            no:'3',
            contractor:"kalai",
            applicators:"4",  
            Applicator:[
                {name:'suman'},
                {name:'sumanraj'},
                {name:"kuthan"}
            ]  
        },
        {
            id:"4",
            no:'4',
            contractor:"vicky",
            applicators:"4",  
            Applicator:[
                {name:'rohit'},
                {name:'virat'},
                {name:"yuvi"}
            ]  
        },
      

    ],
    search:"",
    sortkey:'id',
    sortorder:'asc',
    currentPage:0,
    itemsPerPage: 5,
}

 const projectcoordinatorreducer =(state = initialState ,action)=>{
    switch (action.type){
        case "SHOW_DATA":
            return {    
                ...state,
                dash:[...state.dash]
                }
        case "SEARCH_DATA":
            return{
                ...state,
                search:action.payload,
            }
        case "SET_PAGE":
            return { ...state, currentPage: action.payload };               
        default:
            return state;        
    }
}

export default projectcoordinatorreducer;
