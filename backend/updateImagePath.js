// updateImagePaths.js
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/bakery');

async function updateImagePaths() {
  const products = await Product.find({});
  
  for (const product of products) {
    if (product.images && product.images.length > 0) {
      const updatedImages = product.images.map(img => {
        // If image doesn't start with /uploads/, add it
        if (!img.startsWith('/uploads/')) {
          return `/uploads/products/${img}`;
        }
        return img;
      });
      
      product.images = updatedImages;
      await product.save();
      console.log(`Updated product: ${product.name}`);
    }
  }
  
  console.log('All image paths updated!');
  mongoose.disconnect();
}

updateImagePaths();