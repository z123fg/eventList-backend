const Event = require("../models/event");


exports.getEvents = (req, res) => {
  const limit = +req.query.limit;
  const offset = +req.query.offset;
  const query = Event.find({ creator: req.userData.userId });
  let fetchedResult;
  if (limit && offset) {
    query.skip(limit * (offset - 1)).limit(limit);
  }
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
    isCompleted: false,
    creator: req.userData.userId,
  });
  event
    .save()
    .then((createdEvent) => {
      res.status(201).json({
        message: "event created successfully!",
        result: {
          ...createdEvent,
          id: createdEvent._id,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: `failed to create event: ${err}`,
      });
    });
};

exports.updateEvent = (req, res) => {
  const { id, ...rest } = req.body;
  const event = new Event({
    _id: id,
    ...rest,
  });
  Event
    .updateOne(
      {
        _id: id,
        creator: req.userData.userId,
      },
      event
    )
    .then((result) => {

      if (result.matchedCount > 0) {
        res.status(200).json({ message: "Update successful!" });
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
  Event.deleteOne({ _id: req.params.id , creator:req.userData.userId})
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Failed to authorized!" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: `Deleting posts failed: ${err}`,
      });
    });
};
