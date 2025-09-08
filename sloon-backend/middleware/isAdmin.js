const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    req.flash("error", "Unauthorized access!");
    return res.redirect("/admin/login");
  }
  next();
};

module.exports = isAdmin;