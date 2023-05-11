import {ProjectModel} from "./project.model";

export interface ProjectStoreModel {
  projects: {[projectId: string]: ProjectModel};
  keywords: string[];
  selectedKeywords: string[];
}
