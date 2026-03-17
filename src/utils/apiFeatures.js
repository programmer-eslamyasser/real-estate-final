class APIFeatures {
  constructor(mongooseQuery, queryString) {
    this.query = mongooseQuery;
    this.queryString = queryString;
    this.filterQuery = {};
  }

  // Advanced Filtering  (?price[gte]=100&type=villa)
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.filterQuery = JSON.parse(queryStr);
    this.query = this.query.find(this.filterQuery);
    return this;
  }

  // Text Search (?search=villa cairo)
  search() {
    if (this.queryString.search) {
      const keyword = {
        title: { $regex: this.queryString.search, $options: 'i' },
      };
      this.query = this.query.find(keyword);
    }
    return this;
  }

  // Sorting (?sort=-price,createdAt)
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Field Limiting (?fields=title,price,location)
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Pagination (?page=2&limit=10)
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
