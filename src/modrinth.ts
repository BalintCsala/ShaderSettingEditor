const API_URL = "https://api.modrinth.com/v2/";

export interface ProjectResponse {
    id: string;
    project_type: "mod" | "modpack" | "resourcepack" | "shader";
    title: string;
}

export async function fetchProjectData(slug: string) {
    const response = await fetch(`${API_URL}project/${slug}`);
    const data = (await response.json()) as ProjectResponse;
    return data;
}

export interface ProjectionVersionData {
    name: string;
    version_number: string;
    files: {
        url: string;
        primary: boolean;
        filename: string;
    }[];
}

export type ProjectVersionsResponse = ProjectionVersionData[];

export async function fetchProjectVersions(slug: string) {
    const response = await fetch(`${API_URL}project/${slug}/version`);
    const data = (await response.json()) as ProjectVersionsResponse;
    return data;
}
