const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const Event = require("../models/event")
/* GET home page. */

const todoItems = [
  {
    id: uuidv4(),
    content: "eat breakfast",
    from: new Date("1995-12-17T08:24:00").getTime(),
    to: new Date("1995-12-17T09:00:00").getTime(),
    isComplete:false
  },
  {
    id: uuidv4(),
    content: "eat lunch",
    from: new Date("1995-12-17T11:24:00").getTime(),
    to: new Date("1995-12-17T13:26:00").getTime(),
    isComplete:false
  },
  {
    id: uuidv4(),
    content: "eat dinner",
    from: new Date("1995-12-17T18:24:00").getTime(),
    to: new Date("1995-12-17T19:26:00").getTime(),
    isComplete:false
  },
];
exports.getEvents = (req, res)=> {
  const limit = +req.query.limit;
  const offset = +req.query.offset;
  const query = Event.find({creator:req.userData.userId});
  let fetchedResult;
  if (limit && offset) {
    postQuery.skip(limit * (offset - 1)).limit(limit);
  }
  query.then(result=>{
    fetchedResult = result;
    return Event.count();
  })
  .then(count=>{
    res.status(200).json({
      message:"Event fetched!",
      result:fetchedResult,
      maxCount:count
    })
  })
  .catch(err=>{
    res.status(500).json({
      message: `Fetching posts failed: ${err}`
    });
  })


};

/* exports.postEvent = (req, res) => {
  const newItem = {...req.body,id: uuidv4(), isComplete:false };
  if(validator(newItem)){
    todoItems.unshift(newItem);
    res.status(200).json({message:"New event added!",data:newItem});
  }else{
    res.status(400).json({message:"Invalid data!"});
  }
} */

exports.postEvent = (req,res) => {
  const event = new Event({
      ...req.body,
      isCompleted:false,
      creator:req.userData.userId
  });
  event.save()
  .then(createdEvent=> {
    res.status(201).json({
      message:"event created successfully!",
      result:{
        ...createdEvent,
        id: createdEvent._id
      }
    })
  })
  .catch(err=>{
    res.status(500).json({
      message:`failed to create event: ${err}`
    })
  })
}

/* exports.updateEvent = (req,res)=>{
  const body = req.body;
  const {id} = req.params
  if(todoItems[id]){
    if(validator(body)){
      todoItems[id] = {...todoItem[id],...body};
      res.status(200).json({data:todoItems[id],message:"Event updated!"});
    }else{
      res.status(400).json({message:"Invalid data!"})
    }
    
  }else{
    res.status(400).json({message:"Record cannot be found!"})
  }
}  */

exports.updateEvent = (req,res) => {
  const {id,...rest} = req.body;
  const event = new Event({
    ...rest,
    _id:id,
    creator:req.userData.userId
  });
  Post.updateOne({
    _id:id
  },event)
  .then(result=>{
    if(result.n>0){
      res.status(200).json({ message: "Update successful!" });
    }else{
      res.status(401).json({ message: "Not authorized!" });
    }
  })
  .catch(err=>{
    res.status(500).json({
      message: `Couldn't udpate post: ${err}`
    });
  })
}


/* exports.deleteEvent = (req,res)=>{
  const {id} = req.params;
  if(todoItems[id]){
    todoItems = todoItems.filter(item=>item.id !== id);
    res.status(200).json({data:todoItems.find(item=>item.id===id),message:"Event deleted!"});
  }else{
    res.status(400).json({message:"Record cannot be found!"})
  }
} */

exports.deleteEvent = (req,res) => {
  Event.deleteOne({_id:req.params.id})
  .then(result=>{
    if (result.n > 0) {
      res.status(200).json({ message: "Deletion successful!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  })
  .catch(err => {
    res.status(500).json({
      message: `Deleting posts failed: ${err}`
    });
  });
}

const DATA_TYPE_MAP = {id:"string",content:"string",from:"date",to:"date",isComplete:"boolean"}

const validator = (input) => {
  for(let key in DATA_TYPE_MAP){
    if(!DATA_TYPE_MAP[key]) return false;
    else{
      if(DATA_TYPE_MAP[key]==="date"){
        if(!moment(input[key], 'MM-DD-YYYY, hh:mm',true).isValid()) return false;
      }else{
        if(DATA_TYPE_MAP[key] !==typeof input[key]) return false;

      }
    }
  }
  return true
};
