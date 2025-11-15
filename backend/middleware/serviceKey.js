module.exports = function allowServiceKey(req, res, next) {
  const svc = req.header("x-service-key");
  if (svc && process.env.SERVICE_KEY && svc === process.env.SERVICE_KEY) {
    // impersonate admin for this request only
    req.user = { id: "crm-service", role: "admin" };
    return next();
  }
  return next("SERVKEY_MISSING"); // let the route decide fallback to normal auth
};
