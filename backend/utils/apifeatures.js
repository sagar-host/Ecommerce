class ApiFeatures {
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }
    //so we have make constructor then make search feature for apifeatures
    search(){
        //now we take value of keyword and use ternary operator for condition for search, if get or not ,that we are searching for 
        const keyword = this.queryStr.keyword 
        ? {
            name:{
                $regex:this.queryStr.keyword,
                $options: "i",
            }
        }
        :{};


        this.query = this.query.find({...keyword});
        return this
 

    }



    //filtering category

    filter(){
        const queryCopy = {...this.queryStr}
      

        //removing some fields for category
        const removeFields = ["keyword", "page","limit"];

        
        removeFields.forEach((key)=>delete queryCopy[key]);
       
        //filter for price and rating
        
        console.log(queryCopy);
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`);


        this.query = this.query.find(JSON.parse(queryStr));

        console.log(queryStr);

        return this;


    }


    pagination(resultPerPage){
        const currentPage =  Number(this.queryStr.page ) || 1; //50product in db , per page = 10products, = 5pages

        const skip =  resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }


};


module.exports = ApiFeatures