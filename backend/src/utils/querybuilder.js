const buildSearchQuery = (name, category, minPrice, maxPrice) => {
  const query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  if (category) {
    query.category = { $regex: `^${category}$`, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  return query;
};

module.exports = { buildSearchQuery };
