async function fetchProjectVersions(slug: string) {
    const response = await fetch(API_URL + "project/" + slug + "/version");
    const data = (await response.json()) as ProjectVersionsResponse;
    return data;
}
