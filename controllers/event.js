const Event = require("../models/event");

exports.getEvents = (req, res) => {
  const limit = +req.query.limit;
  const offset = +req.query.offset;

  /*  #swagger.parameters['offset'] = {
                in: 'query',
                type: "string",
                name:"offset",
                required:false,
                description: 'pagination offset'
    } */
  /*  #swagger.parameters['limit'] = {
                in: 'query',
                type: "string",
                name:"limit",
                required:false,
                description: 'pagination limit'
      } */

  /* #swagger.responses[200] = {
    description:"Event fetched",
    schema:{
        message: "Event fetched!",
        result: [
            {
                _id: "619c7c4079c22be0ffb92e24",
                from: "2021-11-23T04:12:12.923Z",
                to: "2021-11-23T04:12:30.327Z",
                content: "go to bed!!!!!",
                isCompleted: false,
                creator: "619c68e8101cae55f5efc1a3",
                __v: "0"
            },
            {
                _id: "619c7c4879c22be0ffb92e26",
                from: "2021-11-23T04:12:12.923Z",
                to: "2021-11-23T04:12:30.327Z",
                content: "go to bed!!!!!??",
                isCompleted: false,
                creator: "619c68e8101cae55f5efc1a3",
                __v: "0"
            }
        ],
        maxCount: "2"
      }
  } */
  /* 
    #swagger.responses[500] = {
      schema:{
      message: "You are not authenticated: JsonWebTokenError: invalid token"
      },
      description:"failed to fetch event"
    }
  */

  const query = Event.find({ creator: req.userData.userId });
  let fetchedResult;
  if (limit && offset) {
    query.skip(+limit * (+offset - 1)).limit(+limit);
  }
  query.sort({ createTime: -1 });
  query
    .then((result) => {
      fetchedResult = result;
      return Event.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Event fetched!",
        result: fetchedResult,
        maxCount: count,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: `Fetching posts failed: ${err}`,
      });
    });
};

exports.postEvent = (req, res) => {
  /*  #swagger.parameters['event'] = {
                in: 'body',
                schema:{
                  from: "2021-11-23T19:25:19.178Z",
                  to: "2021-11-23T19:25:19.178Z",
                  content: "eat breakfast"
                },
                description: 'New event'
              } */
  /* 
      #swagger.responses[201] = {
              description:"event created",
              schema:{
              message: "event created successfully!",
              data: {
              from: "2021-11-23T04:12:12.923Z",
              to: "2021-11-23T04:12:30.327Z",
              content: "go to bed!!!!!",
              isCompleted: false,
              creator: "619c68e8101cae55f5efc1a3",
              __v: 0,
              id: "619d634172c81b93c4838353"
              }
            }
        }
  */
  /* 
      #swagger.responses[500] = {
              description:"failed to create event",
              schema:{
                message: "You are not authenticated: JsonWebTokenError: invalid token"
              }
        }
  */
  const event = new Event({
    ...req.body,
    creator: req.userData.userId,
    createTime: Date.now(),
    updateTime: Date.now(),
  });

  if(new Date(req.body.from).getTime()>new Date(req.body.to).getTime()){
    return res.status(400).json({message:"'from' time should be before 'to' time"});
  };
  event
    .save()
    .then((createdEvent) => {
      const { _id, ...rest } = createdEvent._doc;
      res.status(201).json({
        message: "event created successfully!",
        data: {
          ...rest,
          id: createdEvent._id,
        },
      });
    })
    .catch((err) => {
      res.status(400).json({
        message: `failed to create event: ${err.message}`,
      });
    });
};

exports.updateEvent = (req, res) => {
  /*  #swagger.parameters['event'] = {
              in: 'body',
              schema:{
                from: "2021-11-23T19:25:19.178Z",
                to: "2021-11-23T19:25:19.178Z",
                content: "eat lunch",
                creator:"619c7c4079c22be0ffb92e24"
              },
              description: 'New event'
            } */
  /*  #swagger.parameters['id'] = {
        in: 'path',
        type: "string",
        description: 'target event id'
      } */
  /* 
      #swagger.responses[500] = {
        description:"Couldn't update post",
        schema:{
    message: "Couldn't update post: MongoServerError: Performing an update on the path '_id' would modify the immutable field '_id'"
}
      }
  */
  /* 
      #swagger.responses[200] = {
        description:"update successfully",
        schema:{
          message: "update successfully!"
        }
      }
  */

  let { _id, ...rest } = req.body;
  _id = req.params.id;
  Event.updateOne(
    {
      _id: _id,
      creator: req.userData.userId,
    },
    { ...rest, updateTime: Date.now() }
  )
    .then((result) => {
      if (result.matchedCount > 0) {
        res.status(200).json({ message: "Update successfully!" });
      } else {
        res.status(401).json({ message: "Failed to update" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: `Couldn't update post: ${err}`,
      });
    });
};

exports.deleteEvent = (req, res) => {
  /*  #swagger.parameters['id'] = {
                in: 'path',
                type: "string",
                description: 'target event id'
        } */
  /* 
      #swagger.responses[200] = {
        description:"delete successfully",
        schema:{
          message: "delete successfully!"
        }
      }
  */
  /* 
      #swagger.responses[401] = {
        description:"failed to delete",
        schema:{
          message: "Failed to delete!"
        }
      }
  */
  /* 
      #swagger.responses[500] = {
        description:"failed to delete",
        schema:{
          message: "You are not authenticated: JsonWebTokenError: invalid token"
        }
      }
  */

  Event.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Delete successfully!" });
      } else {
        res.status(401).json({ message: "Failed to delete!" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: `Deleting posts failed: ${err}`,
      });
    });
};
