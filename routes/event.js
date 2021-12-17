const express = require("express");

const EventsController = require("../controllers/event");
const checkAuth = require("../middlewares/check-auth");
const router = express.Router();

router.get("/", checkAuth, EventsController.getEvents);
router.post("/", checkAuth, EventsController.postEvent);
router.put("/:id", checkAuth, EventsController.updateEvent);
router.delete("/:id", checkAuth, EventsController.deleteEvent);

module.exports = router;
