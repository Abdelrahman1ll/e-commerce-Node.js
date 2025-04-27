const Routers = (app) => {
  app.use("/api/auth", require("./aouthRoutes"));
  app.use("/api/user", require("./userRoutes"));
  app.use("/api/category", require("./categoryRoutes"));
  app.use("/api/brand", require("./brandRoutes"));
  app.use("/api/Product", require("./productRoutes"));
  app.use("/api/AllProductInCategory", require("./AllProductInCategoryRoutes"));
  app.use("/api/AllProductInBrand", require("./AllProductInBrandRoutes"));
  app.use("/api/Review", require("./ReviewRoutes"));
  app.use("/api/addresses", require("./AddressesRoutes"));
  app.use("/api/cart", require("./CartRoutes"));
  app.use("/api/order", require("./OrderRoutes"));
  app.use("/api/maintenance", require("./maintenanceRoutes"));
  app.use("/api/v1", require("./CardRoutes"));
  app.use("/api/deliveryAndtax", require("./DeliveryAndTax"));
  app.use("/api", require("./ForgotPasswordRoutes"));
  app.use("/api/customers", require("./CustomerswhoAreNotOnTheSite"));

};

module.exports = Routers;
