import { searchCities } from "../services/searchService.js";

export async function searchCitiesHandler(req, res, next) {
  try {
    const results = await searchCities(req.validatedQuery);
    return res.json({ results });
  } catch (err) {
    return next(err);
  }
}
