import { searchCities } from "../services/searchService.js";
import { searchActivities } from "../services/activityService.js";

export async function searchCitiesHandler(req, res, next) {
  try {
    const results = await searchCities(req.validatedQuery);
    return res.json({ results });
  } catch (err) {
    return next(err);
  }
}

export async function searchActivitiesHandler(req, res, next) {
  try {
    const results = await searchActivities(req.validatedQuery);
    return res.json({ results });
  } catch (err) {
    return next(err);
  }
}
