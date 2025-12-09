const mongoose = require('mongoose');

const customCakeOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  baseCake: {
    type: String,
    required: [true, 'Please select base cake type']
  },
  basePrice: {
    type: Number,
    required: true
  },
  customizations: {
    size: {
      option: String,
      price: Number
    },
    flavor: {
      option: String,
      price: Number
    },
    filling: {
      option: String,
      price: Number
    },
    icing: {
      option: String,
      price: Number
    },
    toppings: [{
      option: String,
      price: Number
    }],
    decorations: [{
      option: String,
      price: Number
    }],
    message: {
      text: String,
      color: String,
      font: String
    },
    theme: {
      option: String,
      price: Number
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Please select delivery date']
  },
  deliveryTime: {
    type: String,
    required: [true, 'Please select delivery time']
  },
  status: {
    type: String,
    enum: ['pending', 'designing', 'baking', 'decorating', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  designImages: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  customerDesignImage: {
    url: String,
    description: String
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactPhone: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  estimatedCompletionTime: Date,
  notes: [{
    text: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number before saving
customCakeOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `CUSTOM-${year}${month}${day}-${random}`;
  }
  next();
});

const CustomCakeOrder = mongoose.model('CustomCakeOrder', customCakeOrderSchema);
module.exports = CustomCakeOrder;