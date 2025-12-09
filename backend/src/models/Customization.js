const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter customization name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter description']
  },
  category: {
    type: String,
    required: [true, 'Please select category'],
    enum: ['Size', 'Flavor', 'Filling', 'Icing', 'Toppings', 'Decoration', 'Message', 'Theme']
  },
  options: [{
    name: {
      type: String,
      required: [true, 'Please enter option name']
    },
    price: {
      type: Number,
      required: [true, 'Please enter option price'],
      min: 0
    },
    description: {
      type: String
    },
    image: {
      type: String
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  required: {
    type: Boolean,
    default: false
  },
  multipleSelection: {
    type: Boolean,
    default: false
  },
  minSelections: {
    type: Number,
    default: 1
  },
  maxSelections: {
    type: Number,
    default: 1
  },
  available: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Customization = mongoose.model('Customization', customizationSchema);
module.exports = Customization;