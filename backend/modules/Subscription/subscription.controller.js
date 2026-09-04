const Subscription = require("./subscription.model");

exports.create = async (req, res) => {
  try {
    const { user_id, plan } = req.body;

    if (!user_id || !plan) {
      return res.status(400).json({
        success: false,
        message: "user_id and plan required"
      });
    }

    const normalizedPlan = String(plan).toUpperCase();
    const startDate = new Date();
    const endDate = new Date();

    if (normalizedPlan === "SILVER") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (normalizedPlan === "GOLD") {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (normalizedPlan === "PLATINUM") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan"
      });
    }

    await Subscription.updateMany(
      { user_id, status: "ACTIVE" },
      { status: "EXPIRED" }
    );

    const subscription = new Subscription({
      user_id,
      plan: normalizedPlan,
      start_date: startDate,
      end_date: endDate
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: "Subscription Activated",
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserSubscription = async (req, res) => {
  try {
    const now = new Date();
    const subscriptions = await Subscription.find({
      user_id: req.params.user_id
    }).sort({ end_date: -1 });

    const active = subscriptions.find(
      (subscription) =>
        subscription.status === "ACTIVE" &&
        new Date(subscription.end_date) >= now
    ) || null;

    res.json({
      success: true,
      data: subscriptions,
      current: active
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
