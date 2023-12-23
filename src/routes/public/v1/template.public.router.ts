import { Router } from "express";
import { publicTemplateMethod } from "../../../controllers/public/v1/template.public.controller";
const r: Router = Router();

r.get("/", publicTemplateMethod);

export default r;
