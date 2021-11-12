var express = require("express");
const moment = require("moment");
var router = express.Router();
const { v4: uuidv4 } = require("uuid");
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
router.get("/", function (req, res, next) {

  res.json(todoItems);
});

router.post("/", (req, res) => {
  const newItem = {...req.body,id: uuidv4(), isComplete:false };
  console.log("newItem",req.body);
  if(validator(newItem)){
    todoItems.unshift(newItem);
    res.status(200).json({message:"New event added!",data:newItem});
  }else{
    res.status(400).json({message:"Invalid data!"});
  }
});

router.put("/",(req,res)=>{
  const {id,...rest} = req.body;

  if(todoItems[id]){
    if(validator(rest)){
      todoItems[id] = {...todoItem[id],...rest};
      res.status(200).json({data:todoItems[id],message:"Event updated!"});
    }else{
      res.status(400).json({message:"Invalid data!"})
    }
    
  }else{
    res.status(400).json({message:"Record cannot be found!"})
  }
}); 
router.delete("/",(req,res)=>{
  const {id} = req.body;
  if(todoItems[id]){
    todoItems = todoItems.filter(item=>item.id !== id);
    res.status(200).json({data:todoItems.find(item=>item.id===id),message:"Event deleted!"});
  }else{
    res.status(400).json({message:"Record cannot be found!"})
  }
});

const dataMap = {id:"string",content:"string",from:"date",to:"date",isComplete:"boolean"}

const validator = (input) => {
  for(let key in datamap){
    if(!dataMap[key]) return false;
    else{
      if(dataMap[key]==="date"){
        if(!moment(input[key], 'MM-DD-YYYY, hh:mm',true).isValid()) return false;
      }else{
        if(dataMap[key] !==typeof input[key]) return false;

      }
    }
  }
  return true
};

module.exports = router;
