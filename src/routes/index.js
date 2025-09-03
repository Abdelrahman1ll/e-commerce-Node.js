// const listEndpoints = require("express-list-endpoints");
const Routers = (app) => {
  app.use("/api/auth", require("./Aouth_Route"));
  app.use("/api/users", require("./User_Route"));
  app.use("/api/categorys", require("./Category_Route"));
  app.use("/api/brands", require("./Brand_Route"));
  app.use("/api/products", require("./Product_Route"));
  app.use("/api/product-category", require("./All_Product_In_Category_Route"));
  app.use("/api/product-brand", require("./All_Product_In_Brand_Route"));
  app.use("/api/reviews", require("./Review_Route"));
  app.use("/api/addresses", require("./Addresses_Routes"));
  app.use("/api/carts", require("./Cart_Route"));
  app.use("/api/orders", require("./Order_Route"));
  app.use("/api/maintenances", require("./Maintenance_Route"));
  app.use("/api/kashier", require("./Card_Route"));
  app.use("/api/delivery-tax", require("./Delivery_And_Tax_Route"));
  app.use("/api", require("./Forgot_Password_Route"));
  app.use("/api/customers", require("./Off_Site_Customers_Route"));

  // اطبع عدد الراوتس والميثودز
  // const endpoints = listEndpoints(app);
  // console.log("عدد الراوتس:", endpoints.length);
  // console.table(endpoints);
};

module.exports = Routers;
