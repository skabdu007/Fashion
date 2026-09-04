const Notification = require("./notification.model");
const Subscription = require("../Subscription/subscription.model");

const buildNotification = ({
  user_id,
  type = "SYSTEM",
  title,
  message,
  link,
  room_code,
  metadata = {}
}) => ({
  user_id,
  type,
  title,
  message,
  link,
  room_code,
  metadata
});

exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    res.json({
      success: true,
      message: "Notification created",
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const data = await Notification.find({
      user_id: req.params.user_id
    }).sort({ createdAt: -1 });

    const unreadCount = data.filter((item) => !item.is_read).length;

    res.json({
      success: true,
      data,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user_id: req.params.user_id,
      is_read: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user_id: req.params.user_id,
        is_read: false
      },
      { is_read: true }
    );

    res.json({
      success: true,
      message: "Notifications marked as read"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.sendAuctionNotification = async (req, res) => {
  try {
    const { title, message, link, room_code, metadata = {} } = req.body;

    const activePlatinumUsers = await Subscription.find({
      plan: "PLATINUM",
      status: "ACTIVE",
      end_date: { $gte: new Date() }
    }).distinct("user_id");

    const notifications = activePlatinumUsers.map((userId) =>
      buildNotification({
        user_id: userId,
        type: "INVITE",
        title,
        message,
        link,
        room_code,
        metadata
      })
    );

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({
      success: true,
      message: "Auction notifications sent to platinum users"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
