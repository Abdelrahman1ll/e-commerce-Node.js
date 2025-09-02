class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 🔹 التصفية حسب السعر
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["sort", "page", "limit"];
    excludeFields.forEach((el) => delete queryObj[el]);

    if (queryObj.category) {
      queryObj.category = queryObj.category;
    }
    
    if (queryObj.brand) {
      queryObj.brand = queryObj.brand;
    }
    
    if (queryObj.title) {
      queryObj.title = { $regex: queryObj.title, $options: "i" };
    }

    // Remove empty filter values
    Object.keys(queryObj).forEach(key => {
      if (typeof queryObj[key] === 'object') {
        Object.keys(queryObj[key]).forEach(operator => {
          if (queryObj[key][operator] === '') {
            delete queryObj[key][operator];
          }
        });
        // If all operators for a field are removed, remove the field
        if (Object.keys(queryObj[key]).length === 0) {
          delete queryObj[key];
        }
      } else if (queryObj[key] === '') {
        delete queryObj[key];
      }
    });

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // 🔹 الفرز بالسعر
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(",", " ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
}

module.exports = ApiFeatures;