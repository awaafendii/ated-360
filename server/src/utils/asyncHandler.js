// Enrobe un contrôleur asynchrone : toute promesse rejetée est transmise
// automatiquement à next(err), évitant les try/catch répétés partout.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
