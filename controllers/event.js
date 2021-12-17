const Event = require("../models/event");

exports.getEvents = (req, res) => {
  const limit = +req.query.limit;
  const offset = +req.query.offset;
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
