const Customization = require("../models/Customization");
const CustomCakeOrder = require("../models/CustomCakeOrder");

const customizationController = {
  getAllCustomizations: async (req, res) => {
    try {
      const customizations = await Customization.find({ available: true }).sort({
        sortOrder: 1,
        category: 1,
      });

      res.json({ success: true, data: customizations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getCustomizationsByCategory: async (req, res) => {
    try {
      const category = req.params.category;

      const customizations = await Customization.find({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        available: true,
      }).sort({ sortOrder: 1 });

      res.json({ success: true, data: customizations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

getBaseCakes: async (req, res) => {
  try {
    const baseCakes = [
      {
        id: "classic-round",
        name: "Classic Round Cake",
        basePrice: 599,
        image: "/images/cakes/classic-round.jpg",
      },
      {
        id: "square-cake",
        name: "Square Cake",
        basePrice: 699,
        image: "/images/cakes/square-cake.jpg",
      },
      {
        id: "heart-shaped",
        name: "Heart Shaped Cake",
        basePrice: 799,
        image: "/images/cakes/heart-shaped.jpg",
      },
      {
        id: "tiered-cake",
        name: "Tiered Cake",
        basePrice: 1499,
        image: "/images/cakes/tiered-cake.jpg",
      },
      {
        id: "cupcake-set",
        name: "Cupcake Set (6 pcs)",
        basePrice: 499,
        image: "/images/cakes/cupcake-set.jpg",
      },
      {
        id: "mini-cake",
        name: "Mini Cake",
        basePrice: 349,
        image: "/images/cakes/mini-cake.jpg",
      },
    ];

    res.json({ success: true, data: baseCakes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
},


  calculateCustomCakePrice: async (req, res) => {
    try {
      const { basePrice, customizations } = req.body;
      let total = basePrice;

      Object.values(customizations || {}).forEach((item) => {
        if (item?.price) total += item.price;
      });

      res.json({
        success: true,
        data: { basePrice, totalPrice: total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  createCustomCakeOrder: async (req, res) => {
    try {
      const order = await CustomCakeOrder.create({
        user: req.user.id,
        ...req.body,
        status: "pending",
      });

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  uploadCustomerDesign: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image",
        });
      }

      const filename = req.file.filename;
      const imageURL = `http://localhost:5000/uploads/designs/${filename}`;

      const order = await CustomCakeOrder.findById(req.params.orderId);
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });

      order.customerDesignImage = { url: imageURL, filename };
      await order.save();

      res.json({ success: true, message: "Design uploaded", data: order.customerDesignImage });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  getUserCustomCakeOrders: async (req, res) => {
    try {
      const orders = await CustomCakeOrder.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  getCustomCakeOrderById: async (req, res) => {
    try {
      const order = await CustomCakeOrder.findById(req.params.orderId);
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });

      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = customizationController;
